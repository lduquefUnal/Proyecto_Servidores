import React, { useState } from 'react';
import HeroCard from '../components/HeroCard';
import TechLogos from '../components/TechLogos';
import diego from '../assets/diego.png';
import Luis from '../assets/Luis.jpg';
import qrImage from '../assets/QR.png';
const AboutUs = () => {
  const [showQR, setShowQR] = useState(false);
  const teamMembers = [
    {
      name: 'Luis Duque',
      role: 'Machine Learning & Cloud Enthusiast',
      imageUrl: Luis,
      githubUrl: 'https://github.com/lduquefUnal  ',
      linkedinUrl: 'www.linkedin.com/in/luis-santiago-duque-franco-0718ab258',
    },
    {
      name: 'Simon Londoño',
      role: 'Machine Learning & Frontend Developer',
      imageUrl: 'https://avatars.githubusercontent.com/u/102399623?v=4',
      githubUrl: 'https://github.com/simonlondonou',
      linkedinUrl: 'https://www.linkedin.com/in/simon-londo%C3%B1o-usma-16356a244/',
    },
    {
      name: 'Juan Diego Oliva',
      role: 'Data Scientist & Backend Developer',
      imageUrl: diego,
      githubUrl: 'https://github.com/JuanOliva2002',
      linkedinUrl: 'https://www.linkedin.com/in/juan-diego-oliva-ramirez-2a5563244/',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">Quiénes Somos</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Somos estudiantes de ingeniería física apasionados por el machine learning, el desarrollo en la nube y la creación de soluciones tecnológicas innovadoras.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
        {teamMembers.map((member, index) => (
          <HeroCard
            key={index}
            name={member.name}
            role={member.role}
            imageUrl={member.imageUrl}
            githubUrl={member.githubUrl}
            linkedinUrl={member.linkedinUrl}
          />
        ))}
      </div>

      <div className="text-center mb-12 bg-gray-200 dark:bg-gray-800 p-8 rounded-lg shadow-inner">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">¿Te gusta nuestro trabajo?</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Si encuentras útil nuestro portafolio y quieres apoyar nuestra pasión por la tecnología, considera invitarnos a un café. ¡Cada contribución nos ayuda a seguir aprendiendo y creando!
        </p>
        <button
          onClick={() => setShowQR(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Invítanos a un café ☕
        </button>
      </div>
      
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-11/12 sm:w-[26rem] max-h-[90vh] overflow-hidden text-center">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              aria-label="Cerrar QR"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">¡Gracias por el café!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Escanea el QR con tu cámara o app bancaria y vuelve para seguir explorando.
            </p>
            <img
              src={qrImage}
              alt="Código QR para invitarnos un café"
              className="mx-auto rounded-lg border border-gray-200 dark:border-gray-700 max-h-[70vh] object-cover"
            />
            <button
              onClick={() => setShowQR(false)}
              className="mt-5 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Volver
            </button>
          </div>
        </div>
      )}

      <TechLogos />
    </div>
  );
};

export default AboutUs;
