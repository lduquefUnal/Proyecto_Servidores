import json
import logging
import os
from typing import List, Dict, Any

import joblib


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def model_fn(model_dir: str) -> Dict[str, Any]:
    """
    Load the scikit‑learn SVM model and its corresponding vectorizer.

    The training notebook saves two Joblib files: ``model.joblib`` (an instance
    of ``LinearSVC``) and ``vectorizer.joblib`` (either a ``CountVectorizer``
    or a ``TfidfVectorizer``).  Both must exist in the root of the model
    directory.  This function deserializes them and returns them in a
    dictionary for use during inference.

    Parameters
    ----------
    model_dir: str
        The directory where SageMaker has unpacked the model tarball.

    Returns
    -------
    Dict[str, Any]
        A dictionary containing the loaded scikit‑learn model and vectorizer.
    """
    model_path = os.path.join(model_dir, "model.joblib")
    vectorizer_path = os.path.join(model_dir, "vectorizer.joblib")

    if not os.path.isfile(model_path) or not os.path.isfile(vectorizer_path):
        raise FileNotFoundError(
            "Los archivos 'model.joblib' y 'vectorizer.joblib' deben estar en el directorio del modelo."
        )

    logger.info("Cargando modelo SVM desde %s", model_path)
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    logger.info("Modelo y vectorizador cargados correctamente.")
    return {"model": model, "vectorizer": vectorizer}


def input_fn(request_body: str, request_content_type: str) -> List[str]:
    """
    Deserialize the input coming from the client.

    This function expects a JSON payload with a key named ``input`` or
    ``input_text`` containing either a single string or a list of strings.
    If a single string is provided it is wrapped into a list for uniform
    downstream processing.

    Parameters
    ----------
    request_body: str
        The raw body of the incoming HTTP request.
    request_content_type: str
        The declared MIME type of the request body.

    Returns
    -------
    List[str]
        A list of strings representing the texts to be vectorized.
    """
    logger.info("Procesando entrada con content-type: %s", request_content_type)
    if request_content_type != "application/json":
        raise ValueError(f"Content-Type no soportado: {request_content_type}")

    data = json.loads(request_body)
    text = data.get("input") or data.get("input_text")
    if text is None:
        raise ValueError("El JSON de entrada debe contener las claves 'input' o 'input_text'.")

    # Ensure we always work with a list of strings
    if isinstance(text, list):
        inputs = [str(t) for t in text]
    else:
        inputs = [str(text)]
    logger.info("Número de textos recibidos para inferencia: %d", len(inputs))
    return inputs


def predict_fn(inputs: List[str], model_info: Dict[str, Any]) -> List[str]:
    """
    Vectorize the inputs and obtain predictions from the loaded SVM model.

    The SVM model does not natively return probabilities; instead it outputs
    class labels directly.  These labels correspond to the target values
    used during training (e.g. "NEGATIVO", "NEUTRO" or "POSITIVO").

    Parameters
    ----------
    inputs: List[str]
        The raw text strings submitted by the client.
    model_info: Dict[str, Any]
        The dictionary returned by ``model_fn`` containing the model and vectorizer.

    Returns
    -------
    List[str]
        The predicted class for each input text.
    """
    model = model_info["model"]
    vectorizer = model_info["vectorizer"]

    logger.info("Vectorizando %d textos...", len(inputs))
    X = vectorizer.transform(inputs)
    logger.info("Realizando predicciones...")
    predictions = model.predict(X)
    # ``model.predict`` returns a numpy array; convert to a Python list of strings
    return [str(p) for p in predictions]


def output_fn(prediction: List[str], response_content_type: str) -> str:
    """
    Serialize the predictions back to JSON.

    The response body will always be of the form ``{"predictions": <list>}``.

    Parameters
    ----------
    prediction: List[str]
        A list of predicted labels returned by ``predict_fn``.
    response_content_type: str
        The requested MIME type of the response.  Only ``application/json`` is supported.

    Returns
    -------
    str
        A JSON string containing the prediction results.
    """
    logger.info("Serializando salida para content-type: %s", response_content_type)
    if response_content_type != "application/json":
        raise ValueError(f"Content-Type no soportado: {response_content_type}")

    return json.dumps({"predictions": prediction}, ensure_ascii=False)