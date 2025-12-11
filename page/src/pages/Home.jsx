import React from 'react';
import ModelCard from '../components/ModelCard';
import digitImageUrl from '../assets/digit.png'; // Importamos la imagen local
import sentimentalimageUrl from '../assets/sentiment.png'; // Importamos la imagen local

function Home() {
  const models = [
    {
      title: "Reconocedor de Dígitos",
      description: "Dibuja un número del 0 al 9 y mira cómo nuestros modelos (Clásico y Cuántico) lo predicen.",
      path: "/reconocedor-digitos",
      imageUrl: digitImageUrl
    },
    {
      title: "Análisis de Sentimiento",
      description: "Escribe un texto y descubre si la emoción es positiva, negativa o neutral usando Transformers o SVM.",
      path: "/analisis-sentimiento",
      imageUrl: sentimentalimageUrl
    },
    {
      title: "Detector de Neumonía",
      description: "Sube una radiografía de tórax para detectar signos de neumonía con nuestro modelo de CNN.",
      path: "/detector-neumonia",
      imageUrl: "https://test-data-model-sagemaker.s3.us-east-1.amazonaws.com/neumonia_test_data/NORMAL/NORMAL2-IM-0045-0001.jpeg"
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
          Explorando Fronteras con IA y Cloud
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Un portafolio de modelos de Machine Learning desplegados en la nube, desde redes neuronales clásicas hasta circuitos cuánticos.
        </p>
      </div>

      {/* Model Showcase Section */}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Nuestros Modelos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {models.map((model) => (
            <ModelCard 
              key={model.title}
              title={model.title}
              description={model.description}
              path={model.path}
              imageUrl={model.imageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
