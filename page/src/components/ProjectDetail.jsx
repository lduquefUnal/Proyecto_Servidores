import React from 'react';
import { FaGithub, FaBook, FaDatabase } from 'react-icons/fa';

const iconMap = {
  Notebook: FaBook,
  'Source Code': FaGithub,
  Dataset: FaDatabase,
};

const ProjectDetail = ({ details }) => {
  const { description, metrics, links } = details;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 md:p-8 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Description */}
        <div className="md:col-span-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sobre el Modelo</h3>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {description}
          </p>
        </div>

        {/* Metrics & Links */}
        <div className="md:col-span-1 space-y-6">
          {/* Metrics */}
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Métricas Clave</h4>
            <ul className="space-y-2">
              {metrics.map((metric, index) => (
                <li key={index} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{metric.name}:</span>
                  <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {metric.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Recursos</h4>
            <div className="flex flex-col space-y-3">
              {links.map((link, index) => {
                const Icon = iconMap[link.name] || FaGithub;
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 group"
                  >
                    <Icon className="mr-3 text-lg" />
                    <span className="group-hover:underline">{link.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
