import React from 'react';
import HeroCard from '../components/HeroCard';
import TechLogos from '../components/TechLogos';

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'Luis Duque',
      role: 'Machine Learning & Cloud Enthusiast',
      imageUrl: 'https://avatars.githubusercontent.com/u/102399623?v=4',
      githubUrl: 'https://github.com/luiseduquefe',
      linkedinUrl: 'https://www.linkedin.com/in/luis-eduardo-duque-fe-a42829238/',
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
      imageUrl: 'https://avatars.githubusercontent.com/u/102399623?v=4',
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
          onClick={() => window.open('https://www.buymeacoffee.com/your-page', '_blank')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Invítanos a un café ☕
        </button>
      </div>
      
      <TechLogos />
    </div>
  );
};

export default AboutUs;
