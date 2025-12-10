import os, io, json, base64
import numpy as np
import pandas as pd
import cv2
import joblib
from skimage.measure import label, regionprops
from skimage import morphology

# Limita el tamaño máximo del lado mayor para controlar memoria/latencia
MAX_SIDE = 512

FEATURE_COLUMNS = ['hu0','hu1','hu2','hu3','hist_mean','hist_std','hist_kurtosis',
                   'fourier_mean','fourier_std','area']

def round_to_sig_figs(value, sig_figs):
    if value == 0 or np.isnan(value):
        return 0.0
    return round(value, sig_figs - int(np.floor(np.log10(abs(value)))) - 1)

def mean_non_zero(image):
    nz = image[image > 0]
    return float(np.mean(nz)) if nz.size > 0 else 0.0

def adjust_image(image, reference_value=130, tolerance=1, max_iterations=2):
    adjusted = image.copy()
    for _ in range(max_iterations):
        diff = reference_value - mean_non_zero(adjusted)
        if abs(diff) <= tolerance:
            break
        adjusted = np.clip(adjusted + diff, 0, 255).astype(np.uint8)
    return adjusted

def procesar_imagen(img, umbral=130, num_areas=2, kernel_size=(7, 7)):
    img = adjust_image(img)
    _, bin_img = cv2.threshold(img, umbral, 255, cv2.THRESH_BINARY_INV)
    kernel = np.ones(kernel_size, np.uint8)
    bin_img = cv2.erode(bin_img, kernel, iterations=2)
    labeled = label(bin_img)
    regions = regionprops(labeled)
    mask = np.ones(bin_img.shape, dtype=bool)
    for region in sorted(regions, key=lambda r: r.area, reverse=True)[:num_areas]:
        mask[tuple(zip(*region.coords))] = False
    filtered = bin_img.copy()
    filtered[~mask] = 0
    filtered = cv2.dilate(filtered, kernel, iterations=3)
    return cv2.bitwise_and(filtered, img)

def extract_features(img):
    feats = {}
    img_proc = morphology.remove_small_objects(img.astype(bool), min_size=20)
    label_img = label(img_proc)
    moments = cv2.moments(img)
    hu = cv2.HuMoments(moments).flatten()
    for i in range(7):
        feats[f'hu{i}'] = round_to_sig_figs(np.sign(hu[i]) * np.log(np.abs(hu[i]) + 1e-10), 6)

    non_zero = img[img > 0]
    feats['avg_intensity'] = round_to_sig_figs(np.mean(non_zero) if non_zero.size else 0, 6)

    hist = cv2.calcHist([img], [0], None, [256], [0, 256]).flatten()
    feats['hist_mean'] = round_to_sig_figs(np.mean(hist), 6)
    feats['hist_std'] = round_to_sig_figs(np.std(hist), 6)
    feats['hist_skewness'] = round_to_sig_figs(pd.Series(hist).skew(), 6)
    feats['hist_kurtosis'] = round_to_sig_figs(pd.Series(hist).kurtosis(), 6)

    edges = cv2.Canny(img, 100, 200)
    feats['edge_density'] = round_to_sig_figs(np.sum(edges) / img.size, 6)

    f_shift = np.fft.fftshift(np.fft.fft2(img))
    mag = 20 * np.log(np.abs(f_shift) + 1e-10)
    feats['fourier_mean'] = round_to_sig_figs(np.mean(mag), 6)
    feats['fourier_std'] = round_to_sig_figs(np.std(mag), 6)

    contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        c = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(c)
    else:
        area = 0.0
    feats['area'] = round_to_sig_figs(area, 6)
    return feats

def _prepare_dataframe(feats):
    data = {k: [feats.get(k, 0.0)] for k in FEATURE_COLUMNS}
    return pd.DataFrame(data)

def model_fn(model_dir):
    return joblib.load(os.path.join(model_dir, "model.joblib"))

def input_fn(request_body, request_content_type):
    if request_content_type == "application/json":
        payload = json.loads(request_body)
        img_b64 = payload.get("image")
        if img_b64 is None:
            raise ValueError("JSON debe traer key 'image' en base64.")
        image_bytes = base64.b64decode(img_b64)
    elif request_content_type == "image/jpeg":
        image_bytes = request_body
    else:
        raise ValueError(f"Content-Type no soportado: {request_content_type}")

    img_array = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("No se pudo decodificar la imagen.")
    # Redimensiona manteniendo aspecto si el lado mayor supera MAX_SIDE
    h, w = img.shape[:2]
    max_side = max(h, w)
    if max_side > MAX_SIDE:
        scale = MAX_SIDE / max_side
        new_size = (int(w * scale), int(h * scale))
        img = cv2.resize(img, new_size, interpolation=cv2.INTER_AREA)
    return img

def predict_fn(input_data, model):
    img_proc = procesar_imagen(input_data)
    feats = extract_features(img_proc)
    df = _prepare_dataframe(feats)
    pred = model.predict(df)[0]
    proba = model.predict_proba(df)[0] if hasattr(model, "predict_proba") else None
    return {"prediction": int(pred),
            "label": {0: "normal", 1: "neumonia", 2: "neumonia_viral", 3: "neumonia_bacteriana"}.get(int(pred), "desconocido"),
            "proba": proba.tolist() if proba is not None else None}

def output_fn(prediction, content_type):
    if content_type == "application/json":
        return json.dumps(prediction)
    return json.dumps(prediction)
