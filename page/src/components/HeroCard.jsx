import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const HeroCard = ({ name, role, imageUrl, githubUrl, linkedinUrl }) => {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg text-center bg-white dark:bg-gray-800 transform hover:scale-105 transition-transform duration-300">
      <div className="w-full h-56 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <img className="w-full h-full object-contain" src={imageUrl} alt={name} />
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{name}</div>
        <p className="text-gray-700 dark:text-gray-300 text-base">{role}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <div className="flex justify-center space-x-4">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <FaGithub size={24} />
            </a>
          )}
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <FaLinkedin size={24} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
