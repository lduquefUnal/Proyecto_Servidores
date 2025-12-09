import json
import os
import base64
import boto3

# Cliente de SageMaker Runtime reutilizable
sagemaker_runtime = boto3.client("sagemaker-runtime")
bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name=os.environ.get("AWS_REGION", "us-east-1"),
)

SAGEMAKER_ENDPOINTS = {
    "/predict/mnist_classical": os.environ.get("ENDPOINT_CLASSICO", "mnist-classical-endpoint"),
    "/predict/mnist_hybrid":   os.environ.get("ENDPOINT_HIBRIDO",  "mnist-quantum-endpoint"),
}

BEDROCK_PATHS = [
    "/bedrock-chat",
    "/api/bedrock-chat",
]

DEEPSEEK_PATHS = [
    "/deepseek-chat",
    "/api/deepseek-chat",
]

SYSTEM_PROMPT = """
Eres un asistente experto y preciso en:
- Machine Learning y Deep Learning (descenso de gradiente y variantes, funciones de pérdida, optimización, arquitecturas profundas, regularización y técnicas de entrenamiento).
- Computación cuántica (qubits, compuertas cuánticas, algoritmos variacionales, VQE, QAOA) y enfoques híbridos cuántico-clásicos aplicados a ML.
- AWS y sus servicios relevantes (Bedrock, SageMaker, Lambda, API Gateway, IAM, S3, ECS/EKS, CI/CD).

Responde siempre como un chatbot: breve, cercano y natural, sin código. Sé claro, conciso, no inventes datos. Explica con rigor conceptual y, cuando aplique, sugiere buenas prácticas de despliegue e integración en AWS.
""".strip()

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

        # 4) Obtener body (para POST sí debe venir algo)
        body = event.get("body")
        if not body:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Cuerpo de la solicitud vacío."}),
            }

        if event.get("isBase64Encoded"):
            body = base64.b64decode(body).decode("utf-8")

        # RUTA BEDROCK (chat conceptual ML)
        if any(p in path for p in BEDROCK_PATHS):
            payload = json.loads(body)
            user_prompt = payload.get("prompt") or payload.get("message") or ""
            if not user_prompt.strip():
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"error": "Falta 'prompt' en el cuerpo."}),
                }

            model_id = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-v2")

            # Modelos de Anthropic Claude 3 usan Messages API; Claude 2 usa prompt/completion.
            if "claude-3" in model_id:
                payload = {
                    "anthropic_version": "bedrock-2023-05-31",
                    "system": SYSTEM_PROMPT,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": user_prompt}
                            ],
                        }
                    ],
                    "max_tokens": 800,
                    "temperature": 0.3,
                    "top_p": 0.9,
                }
            # Amazon Nova (converse/messages API)
            elif "nova" in model_id or "amazon.nova" in model_id:
                payload = {
                    "system": [
                        {"text": SYSTEM_PROMPT}
                    ],
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"text": user_prompt}
                            ],
                        }
                    ],
                    "inferenceConfig": {
                        "maxTokens": 800,
                        "temperature": 0.3,
                        "topP": 0.9,
                    },
                }
            else:
                payload = {
                    # Formato Anthropic v2: tras el prompt del sistema, debe venir "\n\nHuman:" y luego "\n\nAssistant:"
                    "prompt": f"{SYSTEM_PROMPT}\n\nHuman: {user_prompt}\n\nAssistant:",
                    "max_tokens_to_sample": 800,
                    "temperature": 0.3,
                    "top_p": 0.9,
                }

            bedrock_body = json.dumps(payload)

            response = bedrock_runtime.invoke_model(
                modelId=model_id,
                accept="application/json",
                contentType="application/json",
                body=bedrock_body,
            )

            result = json.loads(response["body"].read())
            if "content" in result:  # Claude 3 Messages API
                content = result.get("content") or []
                # Tomar el primer bloque de texto
                text_blocks = [c.get("text", "") for c in content if c.get("type") == "text"]
                reply = (text_blocks[0] if text_blocks else "").strip()
            elif "output" in result and isinstance(result["output"], dict) and "message" in result["output"]:
                # Amazon Nova responde con output.message.content
                content = result["output"].get("message", {}).get("content") or []
                text_blocks = [c.get("text", "") for c in content if c.get("text")]
                reply = (text_blocks[0] if text_blocks else "").strip()
            else:
                reply = (result.get("completion") or "").strip()

            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"response": reply}),
            }

        # RUTA DEEPSEEK EN SAGEMAKER (Marketplace)
        if any(p in path for p in DEEPSEEK_PATHS):
            payload = json.loads(body)
            user_prompt = payload.get("prompt") or payload.get("message") or ""
            if not user_prompt.strip():
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"error": "Falta 'prompt' en el cuerpo."}),
                }

            endpoint_name = os.environ.get("DEEPSEEK_ENDPOINT", "endpoint-quick-start-8zqjp")

            response = sagemaker_runtime.invoke_endpoint(
                EndpointName=endpoint_name,
                ContentType="application/json",
                Body=json.dumps({"prompt": user_prompt}),
            )

            result = response["Body"].read().decode("utf-8")
            try:
                parsed = json.loads(result)
                reply = parsed.get("response") or parsed.get("output") or parsed.get("text") or result
            except Exception:
                reply = result

            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"response": reply}),
            }

        # RUTAS SAGEMAKER
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
