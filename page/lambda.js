const AWS = require('aws-sdk');
const sagemakerRuntime = new AWS.SageMakerRuntime();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucketName = event.bucket;
  const fileKey = event.key;

  // Obtener el archivo de S3
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };
  const file = await s3.getObject(params).promise();

  // Preparar el payload para SageMaker (puedes agregar procesamiento de la imagen aquí)
  const payload = JSON.stringify({
    instances: [
      { data: file.Body.toString('base64') }, // Suponiendo que la imagen es en base64
    ],
  });

  // Invocar el endpoint de SageMaker
  const response = await sagemakerRuntime.invokeEndpoint({
    EndpointName: 'tu-endpoint-de-sagemaker',  // Nombre del endpoint SageMaker
    ContentType: 'application/json',
    Body: payload,
  }).promise();

  // Procesar la respuesta de SageMaker
  const result = JSON.parse(Buffer.from(response.Body).toString('utf8'));
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      prediction: result.prediction,
      confidence: result.confidence, // Suponiendo que SageMaker devuelve un % de confianza
    }),
  };
};
