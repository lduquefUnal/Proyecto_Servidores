import json
import logging
import os
import base64
from io import BytesIO

import torch
import torchvision.transforms as transforms
from PIL import Image

# Importaciones de librerías de modelos
from modelcnn import CNN, Hybrid_QNN
from pysentimiento import create_analyzer
import joblib



# Configuración del logger
logger = logging.getLogger(__name__)

# --- Funciones requeridas por la plataforma de inferencia (e.g., SageMaker) ---

def model_fn(model_dir):
    """
    Carga TODOS los modelos disponibles desde el directorio de modelos.
    Esta función se ejecuta una vez al iniciar el contenedor.
    """
    logger.info("Buscando y cargando modelos...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    models = {}

    # Mapeo de nombres de archivo a clases de modelo y transformaciones
    # Esto hace que el sistema sea extensible. ¡Solo necesitas añadir una entrada aquí para un nuevo modelo!
    # Ajustado para buscar en la carpeta 'mnist/' como en tu descripción.
    vision_model_map = {
        "hybrid_cnn_mnist_weights": {"class": Hybrid_QNN, "transform": get_transform_hqnn(), "path": "mnist/hybrid_cnn_mnist_weights.pth"},
        "cnn_mnist_weights": {"class": CNN, "transform": get_transform_cnn(), "path": "mnist/cnn_mnist_weights.pth"}
        # Añade aquí otros modelos: "nombre_modelo": {"class": ClaseModelo, "transform": su_transformacion}
    }

    # 1. Cargar modelos de visión
    for model_name, model_info in vision_model_map.items():
        model_path = os.path.join(model_dir, model_info["path"])
        if os.path.exists(model_path):
            logger.info(f"Cargando modelo de visión '{model_name}'")
            model_instance = model_info["class"]()
            model_instance.load_state_dict(torch.load(model_path, map_location=device))
            model_instance.to(device).eval()
            models[model_name] = {
                "type": "vision",
                "model": model_instance,
                "transform": model_info["transform"]
            }
        else:
            logger.warning(f"Archivo de pesos no encontrado para el modelo '{model_name}': {model_path}")

    # 2. Cargar modelo de Pysentimiento
    pysentimiento_path = os.path.join(model_dir, "sentimientos", "model_pysentimiento")
    if os.path.isdir(pysentimiento_path):
        logger.info("Cargando modelo de Pysentimiento")
        # Usamos el model_name para apuntar a la carpeta local
        analyzer = create_analyzer(task="sentiment", lang="es", model_name=pysentimiento_path)
        models["pysentimiento-robertuito"] = {
            "type": "nlp",
            "model": analyzer
        }
    else:
        logger.warning(f"Directorio no encontrado para el modelo de pysentimiento: {pysentimiento_path}")

    # 3. Cargar modelos SVM
    svm_dirs = ["svm_countvectorizer", "svm_tfidfvectorizer"]
    for svm_dir_name in svm_dirs:
        svm_dir_path = os.path.join(model_dir, "sentimientos", svm_dir_name)
        if os.path.isdir(svm_dir_path):
            logger.info(f"Cargando modelo SVM desde '{svm_dir_name}'")
            try:
                svm_model = joblib.load(os.path.join(svm_dir_path, "model.joblib"))
                vectorizer = joblib.load(os.path.join(svm_dir_path, "vectorizer.joblib"))
                models[svm_dir_name] = {
                    "type": "svm",
                    "model": svm_model,
                    "vectorizer": vectorizer
                }
            except FileNotFoundError as e:
                logger.error(f"Faltan archivos en {svm_dir_name}: {e}")


    if not models:
        raise RuntimeError("¡No se pudo cargar ningún modelo!")
        
    logger.info(f"Modelos cargados exitosamente: {list(models.keys())}")
    return models


def input_fn(request_body, request_content_type):
    """
    Deserializa los datos de entrada. Espera un JSON con "model" y "input".
    - Para visión: "input" es una imagen en base64.
    - Para nlp: "input" es un string de texto.
    """
    logger.info(f"Procesando entrada con content-type: {request_content_type}")
    if request_content_type == 'application/json':
        data = json.loads(request_body)
        
        model_name = data.get("model")
        if not model_name:
            raise ValueError("El JSON de entrada debe contener la clave 'model'")

        input_content = data.get("input")
        if not input_content:
            raise ValueError("El JSON de entrada debe contener la clave 'input'")

        # Devolvemos todo el diccionario para que predict_fn decida qué hacer
        return data
    else:
        raise ValueError(f"Content-Type no soportado: {request_content_type}")


def predict_fn(input_data, models):
    """
    Realiza la inferencia usando el modelo y la transformación correctos.
    """
    model_name = input_data["model"]
    logger.info(f"Realizando predicción con el modelo: '{model_name}'")
    
    # Verificamos si el modelo solicitado está cargado
    if model_name not in models:
        raise ValueError(f"Modelo '{model_name}' no encontrado. Modelos disponibles: {list(models.keys())}")
    
    model_package = models[model_name]
    model_type = model_package["type"]

    if model_type == "vision":
        logger.info("Ejecutando inferencia de visión")
        image_b64 = input_data["input"]
        image_data = base64.b64decode(image_b64)
        image = Image.open(BytesIO(image_data))
        
        model = model_package["model"]
        transform = model_package["transform"]
        
        input_tensor = transform(image).unsqueeze(0)
        device = next(model.parameters()).device
        input_tensor = input_tensor.to(device)
        
        with torch.no_grad():
            prediction = model(input_tensor)
        return {"prediction": prediction, "type": "vision"}

    elif model_type == "nlp":
        logger.info("Ejecutando inferencia de NLP")
        text = input_data["input"]
        analyzer = model_package["model"]
        resultado = analyzer.predict(text)

        # Mapeo de etiquetas para pysentimiento
        label_mapping = {'POS': 'POSITIVO', 'NEG': 'NEGATIVO', 'NEU': 'NEUTRO'}
        
        # Devolvemos un diccionario ya formateado
        return {
            "prediction": label_mapping.get(resultado.output, 'NEUTRO'),
            "confidence_scores": {label_mapping.get(k, k): v for k, v in resultado.probas.items()},
            "type": "nlp"
        }

    elif model_type == "svm":
        logger.info("Ejecutando inferencia de SVM")
        text = input_data["input"]
        svm_model = model_package["model"]
        vectorizer = model_package["vectorizer"]

        # Transformar el texto de entrada usando el vectorizador cargado
        text_vectorized = vectorizer.transform([text])
        prediction = svm_model.predict(text_vectorized)

        # Devolvemos un diccionario con la predicción
        # Los modelos SVM de scikit-learn no suelen dar scores de confianza fácilmente
        return {"prediction": prediction[0], "type": "svm"}
    else:
        raise ValueError(f"Tipo de modelo desconocido: {model_type}")


def output_fn(prediction, response_content_type):
    """
    Serializa el resultado de la predicción a JSON.
    """
    logger.info(f"Serializando salida para content-type: {response_content_type}")
    if response_content_type == 'application/json':
        if prediction["type"] == "vision":
            # Lógica para formatear la salida de visión
            vision_output = prediction["prediction"]
            probabilities = torch.nn.functional.softmax(vision_output[0], dim=0)
            predicted_idx = torch.argmax(probabilities).item()
            
            response = {
                'predicted_class': predicted_idx,
                'probabilities': [f"{p:.6f}" for p in probabilities.tolist()]
            }
            return json.dumps(response)
        elif prediction["type"] == "nlp":
            # La salida de NLP ya está formateada, solo quitamos la clave 'type'
            nlp_output = prediction.copy()
            del nlp_output["type"]
            return json.dumps(nlp_output)
        elif prediction["type"] == "svm":
            # La salida de SVM ya es un diccionario simple
            svm_output = prediction.copy()
            del svm_output["type"]
            return json.dumps(svm_output)

    else:
        raise ValueError(f"Content-Type no soportado: {response_content_type}")

# --- Funciones de ayuda para las transformaciones ---
# Es bueno separarlas para mantener la claridad, especialmente si cada modelo
# tiene un preprocesamiento diferente.

def get_transform_cnn():
    # Normalización de tu lambda_function.py
    return transforms.Compose([
        transforms.Grayscale(num_output_channels=1),
        transforms.Resize((28, 28)),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

def get_transform_hqnn():
    # Los modelos cuánticos a menudo no necesitan normalización, o usan una diferente.
    # Ajusta esto según el entrenamiento de tu modelo HQNN.
    return transforms.Compose([
        transforms.Grayscale(num_output_channels=1),
        transforms.Resize((28, 28)),
        transforms.ToTensor()
        # Podrías necesitar una normalización a [-1, 1] o [0, pi] dependiendo del encoding
        # transforms.Normalize((0.5,), (0.5,)) 
    ])
