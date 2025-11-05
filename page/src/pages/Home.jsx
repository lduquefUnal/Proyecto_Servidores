import React from 'react';
import ModelCard from '../components/ModelCard'; // Importamos la card

function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Portafolio de Modelos de IA
      </h1>
      
      {/* Usamos un grid para centrar las 3 tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        
        {/* AQUÍ ESTÁ LA CONEXIÓN */}
        {/* 1. A esta card, le damos la ruta al modelo de dígitos */}
        <ModelCard 
          title="Reconocedor de Dígitos"
          description="Dibuja un número del 0 al 9 y mira cómo el modelo lo predice en tiempo real."
          path="/reconocedor-digitos"
        />
        
        {/* 2. A esta card, le damos la ruta al modelo de neumonía */}
        <ModelCard 
          title="Detector de Neumonía"
          description="Sube una radiografía de tórax para detectar signos de neumonía."
          path="/detector-neumonia"
        />
        
        {/* 3. A esta card, le damos la ruta al modelo de sentimiento */}
        <ModelCard 
          title="Análisis de Sentimiento"
          description="Escribe un texto y descubre si la emoción es positiva, negativa o neutral."
          path="/analisis-sentimiento"
        />
        
      </div>
    </div>
  );
}

export default Home;