import React from 'react';
// ¡¡ESTA ES LA IMPORTACIÓN CLAVE!!
import { Link } from 'react-router-dom';

// Este componente recibe las props que le pasamos desde Home.jsx
function ModelCard({ title, description, path, imageUrl }) { // 1. Añadimos imageUrl a las props
  return (
    // 1. Envolvemos TODA la tarjeta en el componente <Link>
    // 2. Le decimos que su destino (prop "to") es el "path" que recibimos.
    //    (ej. "/reconocedor-digitos")
    <Link to={path} className="block bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
      {/* 2. Lógica para mostrar la imagen real o el placeholder */}
      {imageUrl ? (
        <img className="h-48 w-full object-cover" src={imageUrl} alt={`Imagen de ${title}`} />
      ) : (
        <div className="h-48 w-full bg-gray-200 flex items-center justify-center"><span className="text-gray-400">Imagen del Modelo</span></div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        
        {/* El "botón" es solo visual, toda la card es un enlace */}
        <div className="mt-4 text-blue-600 font-semibold">
          Probar modelo &rarr;
        </div>
      </div>
    </Link>
  );
}

export default ModelCard;