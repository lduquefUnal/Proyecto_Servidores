import json
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import base64
import io

# --- 4. El handler principal de la función Lambda ---
def lambda_handler(event, context):
    try:
        # Extraer la imagen codificada en base64 del cuerpo del evento
        body = json.loads(event.get('body', '{}'))
        if 'image' not in body:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No se encontró la clave "image" en el cuerpo de la solicitud.'})
            }
            
        image_data = base64.b64decode(body['image'])
        image = Image.open(io.BytesIO(image_data))

        # Preprocesar la imagen
        image_tensor = transform(image).unsqueeze(0) # Añadir una dimensión de lote (batch)

        # Realizar la inferencia
        with torch.no_grad():
            output = model(image_tensor.to(device))
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            predicted_idx = output.argmax(1).item()
            
            # Crear la respuesta
            response = {
                'predicted_digit': predicted_idx,
                'probabilities': {str(i): prob.item() for i, prob in enumerate(probabilities)}
            }

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' # Permitir peticiones desde cualquier origen
            },
            'body': json.dumps(response)
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
