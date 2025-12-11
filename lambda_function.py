import json
import os
import base64
import boto3

# Reusable SageMaker Runtime client
sagemaker_runtime = boto3.client("sagemaker-runtime")
bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name=os.environ.get("AWS_REGION", "us-east-1"),
)

# SageMaker endpoint mappings
SAGEMAKER_ENDPOINTS = {
    "/predict/mnist_classical": os.environ.get("ENDPOINT_CLASSICO", "mnist-classical-endpoint"),
    "/predict/mnist_hybrid":   os.environ.get("ENDPOINT_HIBRIDO",  "mnist-quantum-endpoint"),
}

# Bedrock and DeepSeek paths
BEDROCK_PATHS = [
    "/bedrock-chat",
    "/api/bedrock-chat",
]

DEEPSEEK_PATHS = [
    "/deepseek-chat",
    "/api/deepseek-chat",
]

# System prompt for Bedrock chat
SYSTEM_PROMPT = """
You are an expert and precise assistant in:
- Machine Learning and Deep Learning (gradient descent and variants, loss functions, optimization, deep architectures, regularization, and training techniques).
- Quantum computing (qubits, quantum gates, variational algorithms, VQE, QAOA) and hybrid quantum-classical approaches applied to ML.
- AWS and its relevant services (Bedrock, SageMaker, Lambda, API Gateway, IAM, S3, ECS/EKS, CI/CD).

Always respond as a chatbot: brief, friendly, and natural, without code. Be clear, concise, do not invent data. Explain with conceptual rigor and, when applicable, suggest good deployment and integration practices in AWS.
""".strip()

def lambda_handler(event, context):
    """
    Lambda that acts as a proxy to SageMaker endpoints.
    """

    print("EVENT:", json.dumps(event))  # for debugging in CloudWatch

    # CORS headers
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
    }

    # 1) Detect the method correctly (HTTP API v2 and REST API v1)
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")  # HTTP API (v2)
        or event.get("httpMethod")                                     # REST API (v1)
        or ""
    ).upper()

    # 2) Respond to preflight CORS
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": ""
        }

    try:
        # 3) Get the path
        # HTTP API v2 → rawPath; REST API v1 → path
        path = event.get("rawPath") or event.get("path", "")
        path = path.lower()

        # 4) Get body (must be present for POST)
        body = event.get("body")
        if not body:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Request body is empty."}),
            }

        if event.get("isBase64Encoded"):
            body = base64.b64decode(body).decode("utf-8")

        # BEDROCK ROUTE (conceptual ML chat)
        if any(p in path for p in BEDROCK_PATHS):
            payload = json.loads(body)
            user_prompt = payload.get("prompt") or payload.get("message") or ""
            if not user_prompt.strip():
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"error": "'prompt' is missing in the body."}),
                }

            model_id = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-v2")

            # Anthropic Claude 3 models use Messages API; Claude 2 uses prompt/completion.
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
                    # Anthropic v2 format: after the system prompt, it must be followed by "\n\nHuman:" and then "\n\nAssistant:"
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
                # Take the first text block
                text_blocks = [c.get("text", "") for c in content if c.get("type") == "text"]
                reply = (text_blocks[0] if text_blocks else "").strip()
            elif "output" in result and isinstance(result["output"], dict) and "message" in result["output"]:
                # Amazon Nova responds with output.message.content
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

        # DEEPSEEK ROUTE IN SAGEMAKER (Marketplace)
        if any(p in path for p in DEEPSEEK_PATHS):
            payload = json.loads(body)
            user_prompt = payload.get("prompt") or payload.get("message") or ""
            if not user_prompt.strip():
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"error": "'prompt' is missing in the body."}),
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

        # SAGEMAKER ROUTES
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
                    "error": f"Could not determine the model from the path ({path})."
                }),
            }

        endpoint_name = SAGEMAKER_ENDPOINTS[model_key]

        # 5) Invoke SageMaker
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
        print(f"JSON decoding error: {e}")
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Request body is not a valid JSON."}),
        }
    except Exception as e:
        error_message = f"Internal server error: {str(e)}"
        print(error_message)
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": error_message}),
        }