import React from 'react';
// ¡¡ESTA ES LA IMPORTACIÓN CLAVE!!
import { Link } from 'react-router-dom';

// Este componente recibe las props que le pasamos desde Home.jsx
function ModelCard({ title, description, path, imageUrl }) { // 1. Añadimos imageUrl a las props
  return (
    // 1. Envolvemos TODA la tarjeta en el componente <Link>
    // 2. Le decimos que su destino (prop "to") es el "path" que recibimos.
    //    (ej. "/reconocedor-digitos")
    <Link to={path} className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/20">
      {/* 2. Lógica para mostrar la imagen real o el placeholder */}
      {imageUrl ? (
        <img className="h-48 w-full object-cover" src={imageUrl} alt={`Imagen de ${title}`} />
      ) : (
        <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><span className="text-gray-400 dark:text-gray-500">Imagen del Modelo</span></div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm">{description}</p>
        
        {/* El "botón" es solo visual, toda la card es un enlace */}
        <div className="mt-4 text-blue-600 dark:text-blue-400 font-semibold">
          Probar modelo &rarr;
        </div>
      </div>
    </Link>
  );
}

export default ModelCard;