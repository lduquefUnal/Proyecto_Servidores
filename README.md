# Lambda Proxy para SageMaker y Bedrock

Esta función Lambda actúa como un proxy para invocar diferentes modelos de machine learning alojados en Amazon SageMaker y modelos de IA generativa de Amazon Bedrock. Proporciona un único punto de entrada (API Gateway) para acceder a múltiples modelos, abstrayendo la complejidad de invocar cada servicio.

## Características

- **Proxy Multi-Servicio**: Soporta la invocación de modelos de:
  - Amazon SageMaker (para modelos de ML personalizados como clasificadores de MNIST).
  - Amazon Bedrock (para modelos de IA generativa como Anthropic Claude y Amazon Nova).
  - SageMaker Marketplace (para modelos como DeepSeek).
- **Manejo de CORS**: Responde automáticamente a las solicitudes preflight de CORS (`OPTIONS`), permitiendo que la API sea llamada desde aplicaciones web.
- **Enrutamiento Dinámico**: Enruta las solicitudes al servicio de backend apropiado según la ruta de la URL.
- **Configuración Centralizada**: Utiliza variables de entorno para gestionar los nombres de los endpoints y los ID de los modelos, facilitando la actualización sin cambiar el código.
- **Manejo de Errores**: Proporciona mensajes de error claros para problemas comunes como JSON inválido, cuerpos de solicitud vacíos o errores internos del servidor.

## Equipo
- Luis Duque
- Diego Avila

## Cómo Reproducir el Repositorio en Local

Para reproducir este repositorio en tu entorno local, sigue estos pasos:

### 1. Prerrequisitos

- **Cuenta de AWS**: Necesitarás una cuenta de AWS para desplegar los modelos en SageMaker y utilizar los servicios de Bedrock y Lambda.
- **AWS CLI**: Instala y configura la [AWS CLI](https://aws.amazon.com/cli/) con tus credenciales.
- **Python y Jupyter**: Asegúrate de tener Python 3.8+ y Jupyter Notebook o JupyterLab instalado.
- **Node.js y npm**: Necesitarás Node.js y npm para ejecutar la aplicación web de React.

### 2. Clonar el Repositorio

```bash
git clone <URL-del-repositorio>
cd <nombre-del-repositorio>
```

### 3. Configuración del Backend (Modelos y Despliegue)

1.  **Entorno Virtual**: Crea y activa un entorno virtual de Python.
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

2.  **Instalar Dependencias**: Instala las dependencias de Python.
    ```bash
    pip install -r requirements.txt
    ```
    *Nota: Es posible que necesites instalar dependencias adicionales que se encuentran en los `requirements.txt` de cada modelo.*

3.  **Entrenar los Modelos (Opcional)**: Si deseas re-entrenar los modelos, puedes ejecutar los notebooks de entrenamiento que se encuentran en las carpetas de cada modelo (e.g., `modelos/sentimientos/`).

4.  **Desplegar los Modelos en SageMaker**:
    - Abre el notebook `deploy.ipynb`.
    - Asegúrate de que tu rol de ejecución de SageMaker tenga los permisos necesarios.
    - Sigue los pasos del notebook para empaquetar los modelos, subirlos a S3 y desplegarlos como endpoints de SageMaker.
    - **Importante**: El despliegue de endpoints en SageMaker incurrirá en costos en tu cuenta de AWS.

### 4. Configuración del Frontend (Aplicación Web)

1.  **Navega a la Carpeta de la Página**:
    ```bash
    cd page
    ```

2.  **Instalar Dependencias de Node.js**:
    ```bash
    npm install
    ```

3.  **Configurar la API**: En el código de la aplicación de React (probablemente en un archivo de configuración o servicio de API), asegúrate de que la URL del endpoint de la API Gateway apunte a la API que creaste.

4.  **Ejecutar la Aplicación en Local**:
    ```bash
    npm run dev
    ```
    Esto iniciará un servidor de desarrollo local y podrás ver la aplicación en tu navegador en `http://localhost:5173` (o el puerto que se indique).

### 5. Despliegue de la Función Lambda y API Gateway

1.  **Crea la Función Lambda**:
    - En la consola de AWS, crea una nueva función Lambda.
    - Sube el código de `lambda_function.py`.
    - Configura las variables de entorno como se describe en la siguiente sección.

2.  **Configura los Permisos de IAM**: Asegúrate de que el rol de ejecución de la Lambda tenga los permisos de IAM necesarios para invocar los endpoints de SageMaker y los modelos de Bedrock.

3.  **Crea el Disparador de API Gateway**:
    - Crea una nueva API Gateway (REST o HTTP).
    - Crea un recurso y un método `POST` que se integre con tu función Lambda.
    - No olvides añadir un método `OPTIONS` para el manejo de CORS.
    - Despliega la API.

## Despliegue y Configuración

### 1. Variables de Entorno

La función Lambda requiere las siguientes variables de entorno para ser configurada:

| Variable             | Descripción                                                                                             | Valor por Defecto              |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `ENDPOINT_CLASSICO`  | El nombre del endpoint de SageMaker para el modelo clásico de MNIST.                                    | `mnist-classical-endpoint`     |
| `ENDPOINT_HIBRIDO`   | El nombre del endpoint de SageMaker para el modelo híbrido (cuántico) de MNIST.                           | `mnist-quantum-endpoint`       |
| `BEDROCK_MODEL_ID`   | El ID del modelo de Bedrock a utilizar para el chat conceptual.                                          | `anthropic.claude-v2`          |
| `DEEPSEEK_ENDPOINT`  | El nombre del endpoint de SageMaker para el modelo DeepSeek (del Marketplace).                          | `endpoint-quick-start-8zqjp` |
| `AWS_REGION`         | La región de AWS donde se despliegan los servicios.                                                     | `us-east-1`                    |

### 2. Permisos de IAM

El rol de ejecución de la función Lambda necesita los siguientes permisos de IAM para invocar los servicios de backend:

- **SageMaker**:
  - `sagemaker:InvokeEndpoint` en los endpoints específicos de SageMaker.
- **Bedrock**:
  - `bedrock:InvokeModel` en los modelos específicos de Bedrock.

Aquí hay un ejemplo de política de IAM que puedes adjuntar a tu rol de ejecución de Lambda:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "SageMakerInvokeEndpointAccess",
            "Effect": "Allow",
            "Action": "sagemaker:InvokeEndpoint",
            "Resource": [
                "arn:aws:sagemaker:<region>:<account-id>:endpoint/mnist-classical-endpoint",
                "arn:aws:sagemaker:<region>:<account-id>:endpoint/mnist-quantum-endpoint",
                "arn:aws:sagemaker:<region>:<account-id>:endpoint/endpoint-quick-start-8zqjp"
            ]
        },
        {
            "Sid": "BedrockInvokeModelAccess",
            "Effect": "Allow",
            "Action": "bedrock:InvokeModel",
            "Resource": "arn:aws:bedrock:<region>::foundation-model/*"
        }
    ]
}
```

**Nota**: Recuerda reemplazar `<region>` y `<account-id>` con tu región y ID de cuenta de AWS específicos. Para mayor seguridad, puedes restringir el `Resource` para Bedrock al ARN del modelo específico en lugar de usar un comodín.

### 3. Disparador de API Gateway

Para exponer la función Lambda como una API pública, necesitas crear un disparador de API Gateway. Puedes usar una API REST o una API HTTP.

- **Crear una API Gateway**: En la consola de AWS, crea una nueva API Gateway.
- **Crear un recurso y método**: Crea un recurso (e.g., `/proxy`) con un método `POST` y un método `OPTIONS` para CORS.
- **Establecer la integración**: Configura el método `POST` para que se integre con tu función Lambda.
- **Desplegar la API**: Despliega tu API a una etapa (e.g., `prod`).

La URL final se verá algo así: `https://<api-id>.execute-api.<region>.amazonaws.com/prod/proxy`.

## Uso

Puedes invocar la función Lambda enviando una solicitud `POST` a la URL de la API Gateway. El cuerpo y la ruta de la solicitud determinarán qué modelo se invoca.

### Modelos MNIST de SageMaker

- **Ruta**: `/predict/mnist_classical` o `/predict/mnist_hybrid`
- **Método**: `POST`
- **Cuerpo**:
  ```json
  {
      "image": "<imagen-codificada-en-base64>"
  }
  ```

### Chat Conceptual de Bedrock

- **Ruta**: `/bedrock-chat`
- **Método**: `POST`
- **Cuerpo**:
  ```json
  {
      "prompt": "Explica la diferencia entre la computación clásica y cuántica."
  }
  ```

### Chat de DeepSeek

- **Ruta**: `/deepseek-chat`
- **Método**: `POST`
- **Cuerpo**:
  ```json
  {
      "prompt": "Escribe una función en Python para calcular el factorial de un número."
  }
  ```
