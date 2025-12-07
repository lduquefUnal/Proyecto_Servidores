import json
import boto3
import os

# Cliente de SageMaker Runtime reutilizable
sagemaker_runtime = boto3.client("sagemaker-runtime")

SAGEMAKER_ENDPOINTS = {
    "/predict/mnist_classical": os.environ.get("ENDPOINT_CLASSICO", "mnist-classical-endpoint"),
    "/predict/mnist_hybrid":   os.environ.get("ENDPOINT_HIBRIDO",  "mnist-quantum-endpoint"),
}

def lambda_handler(event, context):
    """
    Lambda que actúa como proxy hacia los endpoints de SageMaker.
    """

    print("EVENT:", json.dumps(event))  # para debug en CloudWatch

    # Headers CORS
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
    }

    # 1) Detectar el método correctamente (HTTP API v2 y REST API v1)
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")  # HTTP API (v2)
        or event.get("httpMethod")                                     # REST API (v1)
        or ""
    ).upper()

    # 2) Responder el preflight CORS
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": ""
        }

    try:
        # 3) Obtener el path
        # HTTP API v2 → rawPath; REST API v1 → path
        path = event.get("rawPath") or event.get("path", "")
        path = path.lower()

        # Si tuvieras stage tipo "/default/...", podrías normalizar,
        # pero como tú ya estás usando /predict/mnist_classical directo,
        # simplemente buscamos por substring:
        model_key = None
        for key in SAGEMAKER_ENDPOINTS:
            if key in path:
                model_key = key
                break

        if not model_key:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({
                    "error": f"No se pudo determinar el modelo a partir de la ruta ({path})."
                }),
            }

        endpoint_name = SAGEMAKER_ENDPOINTS[model_key]

        # 4) Obtener body (para POST sí debe venir algo)
        body = event.get("body")
        if not body:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Cuerpo de la solicitud vacío."}),
            }

        # Si el body viniera en base64 (a veces pasa en HTTP API),
        # aquí podrías decodificarlo, pero por ahora asumimos JSON texto.
        # json.loads(body)  # valida que sea JSON; opcional

        # 5) Invocar SageMaker
        response = sagemaker_runtime.invoke_endpoint(
            EndpointName=endpoint_name,
            ContentType="application/json",
            Body=body,
        )

        result = response["Body"].read().decode("utf-8")

        return {
            "statusCode": 200,
            "headers": headers,
            "body": result,
        }

    except json.JSONDecodeError as e:
        print(f"Error de decodificación JSON: {e}")
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Cuerpo de la solicitud no es un JSON válido."}),
        }
    except Exception as e:
        error_message = f"Error interno del servidor: {str(e)}"
        print(error_message)
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": error_message}),
        }
