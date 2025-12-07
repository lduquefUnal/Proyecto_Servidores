import json
import logging
import os
from typing import List, Dict, Any

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F


# Configure a basic logger. SageMaker will stream these logs to CloudWatch.
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def _map_label(label: str) -> str:
    """
    Map the raw labels coming from the Hugging Face model to the custom
    Spanish labels expected by the front‑end.  The pre‑trained model used
    by PySentimiento exposes three labels (NEG, NEU and POS).  Those
    abbreviations are mapped to full Spanish words here.  If an unknown
    label is encountered the function defaults to "NEUTRO".

    Parameters
    ----------
    label: str
        The raw label returned by the Hugging Face model (e.g. "NEG", "NEU", "POS").

    Returns
    -------
    str
        A human friendly label ("NEGATIVO", "NEUTRO" or "POSITIVO").
    """
    mapping = {
        "NEG": "NEGATIVO",
        "NEU": "NEUTRO",
        "POS": "POSITIVO",
    }
    return mapping.get(label, "NEUTRO")


def model_fn(model_dir: str) -> Dict[str, Any]:
    """
    Load the Hugging Face sentiment analysis model from the model directory.

    The directory passed in by SageMaker during inference will contain
    the files that were added at packaging time (e.g. config.json,
    model.safetensors, tokenizer.json, etc.).  Using AutoTokenizer and
    AutoModelForSequenceClassification ensures the correct configuration
    and weights are loaded regardless of model file names.

    Parameters
    ----------
    model_dir: str
        The absolute path to the directory where model artifacts are unpacked.

    Returns
    -------
    Dict[str, Any]
        A dictionary holding the loaded model and tokenizer.  This object is
        passed to predict_fn on every invocation.
    """
    logger.info("Cargando modelo y tokenizer Hugging Face desde %s", model_dir)
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    model.eval()
    logger.info("Modelo cargado correctamente.")
    return {"tokenizer": tokenizer, "model": model}


def input_fn(request_body: str, request_content_type: str) -> List[str]:
    """
    Parse and validate the incoming request body.

    The expected content type is ``application/json``.  The body should
    contain a key called ``input`` or ``input_text`` whose value is either
    a single string or a list of strings.  If a single string is supplied
    it will be wrapped in a list for uniform processing downstream.

    Parameters
    ----------
    request_body: str
        The raw HTTP request body sent by the client.
    request_content_type: str
        The MIME type of the request.

    Returns
    -------
    List[str]
        A list of text inputs ready to be tokenized.
    """
    logger.info("Procesando entrada con content-type: %s", request_content_type)
    if request_content_type != "application/json":
        raise ValueError(f"Content-Type no soportado: {request_content_type}")

    data = json.loads(request_body)
    # Accept either "input" or "input_text" for flexibility
    text = data.get("input") or data.get("input_text")
    if text is None:
        raise ValueError("El JSON de entrada debe contener las claves 'input' o 'input_text'.")

    # Return a list of strings.  If a single string was provided wrap it in a list.
    if isinstance(text, list):
        inputs = [str(t) for t in text]
    else:
        inputs = [str(text)]

    logger.info("Número de textos recibidos para inferencia: %d", len(inputs))
    return inputs


def predict_fn(inputs: List[str], model_info: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Perform sentiment classification on a batch of inputs.

    Tokenizes the input texts, runs them through the loaded Hugging Face model,
    computes probabilities via softmax and maps the resulting labels to the
    Spanish descriptors defined in `_map_label`.  Each result includes the
    predicted label and per‑class probabilities.

    Parameters
    ----------
    inputs: List[str]
        A list of raw text strings to analyse.
    model_info: Dict[str, Any]
        The dictionary returned by `model_fn` containing the model and tokenizer.

    Returns
    -------
    List[Dict[str, Any]]
        A list of prediction dictionaries.  Each dictionary contains two keys:
        ``label`` (the mapped Spanish label) and ``probabilities`` (a mapping
        of Spanish labels to probabilities).
    """
    tokenizer: AutoTokenizer = model_info["tokenizer"]
    model: AutoModelForSequenceClassification = model_info["model"]

    # Tokenize the input batch.  We use padding and truncation to handle
    # variable length sentences.  ``return_tensors='pt'`` yields PyTorch tensors.
    encoding = tokenizer(
        inputs,
        padding=True,
        truncation=True,
        return_tensors="pt",
    )

    # Forward pass without computing gradients.
    with torch.no_grad():
        outputs = model(**encoding)
        logits = outputs.logits
        probabilities = F.softmax(logits, dim=-1)

    # id2label maps the numerical class index to the raw label (e.g. "NEG")
    id2label = model.config.id2label

    results: List[Dict[str, Any]] = []
    for idx in range(len(inputs)):
        # Get the index with the highest probability
        pred_idx = int(torch.argmax(probabilities[idx]).item())
        raw_label = id2label.get(pred_idx, "NEU")  # default to NEU if missing
        mapped_label = _map_label(raw_label)

        # Build probability dictionary with mapped labels
        prob_dict = {}
        for j in range(probabilities.shape[1]):
            lbl = _map_label(id2label.get(j, "NEU"))
            prob_dict[lbl] = float(probabilities[idx][j].item())
a
        results.append({
            "label": mapped_label,
            "probabilities": prob_dict,
        })

    return results


def output_fn(prediction: List[Dict[str, Any]], response_content_type: str) -> str:
    """
    Serialize the prediction into a JSON string.

    Parameters
    ----------
    prediction: List[Dict[str, Any]]
        The list of results returned by `predict_fn`.
    response_content_type: str
        The desired MIME type for the response.  Only ``application/json`` is supported.

    Returns
    -------
    str
        A JSON encoded string containing the predictions.
    """
    logger.info("Serializando salida para content-type: %s", response_content_type)
    if response_content_type != "application/json":
        raise ValueError(f"Content-Type no soportado: {response_content_type}")

    return json.dumps({"predictions": prediction}, ensure_ascii=False)