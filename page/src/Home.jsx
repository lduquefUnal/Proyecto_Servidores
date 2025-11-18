import React from 'react';
import { Link } from 'react-router-dom';
import digitImageUrl from './assets/digit.png'; // 1. Importamos tu imagen

// Datos de las tarjetas de los modelos
const models = [
  {
    name: 'Reconocedor de Dígitos',
    description: 'Dibuja un dígito y la IA intentará adivinar cuál es. Entrenado con el dataset MNIST.',
    href: '/reconocedor-digitos',
    imageUrl: digitImageUrl, // 2. Usamos la imagen importada
  },
  {
    name: 'Detector de Neumonía',
    description: 'Sube una radiografía de tórax y el modelo predecirá si hay signos de neumonía.',
    href: '/detector-neumonia',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-6c1d7349e2c5?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Análisis de Sentimiento',
    description: 'Escribe un texto y la IA determinará si el sentimiento es positivo, negativo o neutral.',
    href: '/analisis-sentimiento',
    imageUrl: 'https://images.unsplash.com/photo-1557835292-b36c3b651739?q=80&w=2070&auto=format&fit=crop',
  },
];

const Home = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Portafolio de Modelos de IA</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {models.map((model) => (
          <Link to={model.href} key={model.name} className="group block bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl">
            <img className="h-48 w-full object-cover" src={model.imageUrl} alt={`Imagen de ${model.name}`} />
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600">{model.name}</h2>
              <p className="text-gray-700 text-base">{model.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;