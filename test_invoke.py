import boto3
import json
import base64
import botocore

# ⚙️ Configura aquí el endpoint y la región
ENDPOINT_NAME = "mnist-hybrid"   # nombre EXACTO del punto de conexión
AWS_REGION = "us-east-1"         # región donde lo creaste

# Imagen de prueba (puedes usar la misma que usabas en local_test.py)
TEST_IMAGE_PATH = "test_digit.png"

# Configuración de Boto3 con timeout
from botocore.config import Config
boto_config = Config(
    read_timeout=120,      # tiempo máximo esperando la respuesta
    retries={"max_attempts": 3}
)

# Cliente de runtime de SageMaker
runtime = boto3.client("sagemaker-runtime", region_name=AWS_REGION, config=boto_config)

# 1. Leer la imagen y convertirla a base64
with open(TEST_IMAGE_PATH, "rb") as f:
    image_bytes = f.read()

image_b64 = base64.b64encode(image_bytes).decode("utf-8")

# 2. Construir el payload EXACTAMENTE como lo espera tu input_fn
#    { "input": "<imagen_en_base64>" }
payload = {
    "input": image_b64
}

try:
    # 3. Invocar el endpoint
    response = runtime.invoke_endpoint(
        EndpointName=ENDPOINT_NAME,
        ContentType="application/json",
        Accept="application/json",
        Body=json.dumps(payload),
    )

    status_code = response["ResponseMetadata"]["HTTPStatusCode"]
    body_str = response["Body"].read().decode("utf-8")

    print(f"HTTP status: {status_code}")
    print("Respuesta cruda del endpoint:")
    print(body_str)

    # 4. Intentar parsear como JSON para verlo bonito
    try:
        body_json = json.loads(body_str)
        print("\nJSON parseado:")
        print(json.dumps(body_json, indent=2, ensure_ascii=False))
    except json.JSONDecodeError:
        print("\n(No es JSON válido, se muestra como texto)")

except botocore.exceptions.ClientError as e:
    print("❌ Error al invocar el endpoint:")
    print("Código:", e.response["Error"]["Code"])
    print("Mensaje:", e.response["Error"]["Message"])
    print("RequestId:", e.response["ResponseMetadata"].get("RequestId"))
    raise
