import React from 'react';
// ¡¡ESTA ES LA IMPORTACIÓN CLAVE!!
import { Link } from 'react-router-dom';

// Este componente recibe las props que le pasamos desde Home.jsx
function ModelCard({ title, description, path }) {
  return (
    // 1. Envolvemos TODA la tarjeta en el componente <Link>
    // 2. Le decimos que su destino (prop "to") es el "path" que recibimos.
    //    (ej. "/reconocedor-digitos")
    <Link to={path} className="block bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
      <div className="p-6">
        {/* Imagen de placeholder */}
        <div className="w-full h-32 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
          <span className="text-gray-400">Imagen del Modelo</span>
        </div>
        
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