# Procesos del Proyecto

Resumen en español de las etapas que implementamos, pensado para explicar rápido en la exposición: cómo entrenamos, empaquetamos, desplegamos y exponemos los modelos.

## 1. Entrenamiento y preparación de modelos

- **Trabajo en notebooks**: Cada modelo se entrena en su propio notebook de Jupyter (ej. `modelos/sentimientos`, `modelos/neumonia`).
- **Pasos comunes**: carga y preprocesado de datos, definición del modelo (scikit-learn, PyTorch, etc.), entrenamiento y evaluación rápida.
- **Artefactos**: guardamos el modelo en `.joblib` (o `.pth` para PyTorch) y preparamos el código de inferencia (`code/inference.py`, `code/__init__.py`, `code/requirements.txt`).

## 2. Empaquetado para SageMaker (tar.gz sin cachés)

Usamos `tar` con exclusiones para no arrastrar `__pycache__`, `*.pyc` ni checkpoints de notebooks.

- **Sentimientos (SVM + CountVectorizer)**:
  ```bash
  tar -czvf modelos/sentimientos/svm_countvectorizer/model.tar.gz \
    --exclude='*/__pycache__' --exclude='*.pyc' --exclude='*/.ipynb_checkpoints*' \
    -C modelos/sentimientos/svm_countvectorizer \
    model.joblib vectorizer.joblib \
    code/inference.py code/__init__.py code/requirements.txt
  ```

- **Neumonía**:
  ```bash
  tar -czvf modelos/neumonia/model.tar.gz \
    --exclude='*/__pycache__' --exclude='*.pyc' --exclude='*/.ipynb_checkpoints*' \
    -C modelos/neumonia \
    model.joblib \
    code/inference.py code/__init__.py code/requirements.txt
  ```

## 3. Despliegue en SageMaker

El notebook `deploy.ipynb` orquesta el despliegue:
1) Subimos cada `model.tar.gz` a S3.
2) Creamos el objeto `sagemaker.Model` apuntando al tar.gz y a la imagen (scikit-learn/PyTorch).
3) Ejecutamos `deploy()` para crear el endpoint (provisiona la instancia y el contenedor).

## 4. Proxy Lambda + API Gateway

- **Lambda (`lambda_function.py`)**: proxy único que recibe solicitudes HTTP, decide qué endpoint de SageMaker o Bedrock invocar, maneja CORS y errores. Usa variables de entorno para los nombres de endpoints/modelos.
- **API Gateway**: expone la Lambda por HTTP (`POST` y `OPTIONS`), listo para que lo consuma el frontend.

## 5. Interfaz web (React)

- Código en `page/`: componentes para carga de imágenes (MNIST/Neumonía), textos (sentimientos/chat) y visualización de resultados.
- Consume la API de Gateway; configura la URL del endpoint en el cliente.
- Para desarrollo local: `cd page && npm install && npm run dev`.

## 6. Secuencia para demo

1) Mostrar el flujo: Frontend → API Gateway → Lambda → Endpoints SageMaker / Bedrock.
2) Hacer una inferencia en vivo (ej. imagen de neumonía o texto de sentimiento).
3) Resaltar empaquetado limpio (tar.gz sin cachés) y despliegue automatizado desde el notebook.
