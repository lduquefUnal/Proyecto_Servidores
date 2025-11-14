import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';  // Este archivo es generado por Amplify

Amplify.configure(awsconfig);


import { Storage } from 'aws-amplify';

// Subir una imagen a S3
async function uploadImage(file) {
  try {
    const result = await Storage.put('image.jpg', file, {
      contentType: 'image/jpeg',
    });
    console.log('Imagen subida:', result);
  } catch (error) {
    console.error('Error al subir la imagen:', error);
  }
}

import { API } from 'aws-amplify';

// Realizar la predicción al backend
async function predictImage(fileKey) {
  try {
    const response = await API.post('prediccionesApi', '/predict', {
      body: {
        bucket: 'mi-bucket',  // Nombre de tu bucket S3
        key: fileKey,         // Clave del archivo en S3
      },
    });
    console.log('Predicción recibida:', response);
    // Mostrar la predicción en el UI
  } catch (error) {
    console.error('Error en la predicción:', error);
  }
}
