import json
from pysentimiento import create_analyzer

# 1. Función para cargar el analizador
def model_fn(model_dir):
    # Carga el modelo pre-entrenado de pysentimiento
    analyzer = create_analyzer(task="sentiment", lang="es", device="cpu")
    return analyzer

# 2. Función para deserializar la entrada JSON
def input_fn(request_body, content_type='application/json'):
    data = json.loads(request_body)
    # Asume que el frontend envía: {"text": "El tweet a analizar"}
    return data['text']

# 3. Función para realizar la predicción
def predict_fn(input_object, model):
    resultado = model.predict(input_object)
    
    # Mapeo de etiquetas: POS -> POSITIVO, NEG -> NEGATIVO, NEU -> NEUTRO
    label_mapping = {'POS': 'POSITIVO', 'NEG': 'NEGATIVO', 'NEU': 'NEUTRO'}
    
    return {
        'prediction': label_mapping.get(resultado.output, 'NEUTRO'),
        'confidence_scores': {label_mapping.get(k, k): v for k, v in resultado.probas.items()}
    }