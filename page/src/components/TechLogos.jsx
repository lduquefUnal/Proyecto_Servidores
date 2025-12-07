import React from 'react';
import HorizontalCarousel from './HorizontalCarousel';

const technologies = [
  { name: 'React', logo: 'https://cdn.simpleicons.org/react/61DAFB' },
  { name: 'Tailwind CSS', logo: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
  { name: 'Vite', logo: 'https://cdn.simpleicons.org/vite/646CFF' },
  { name: 'JavaScript', logo: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
  { name: 'Python', logo: 'https://cdn.simpleicons.org/python/3776AB' },
  { name: 'PyTorch', logo: 'https://cdn.simpleicons.org/pytorch/EE4C2C' },
  { name: 'Scikit-learn', logo: 'https://cdn.simpleicons.org/scikitlearn/F7931E' },
  { name: 'Pandas', logo: 'https://cdn.simpleicons.org/pandas/150458' },
  { name: 'Numpy', logo: 'https://cdn.simpleicons.org/numpy/013243' },
  { name: 'Amazon AWS', logo: 'https://cdn.simpleicons.org/amazonaws/232F3E' },
  { name: 'Amazon SageMaker', logo: 'https://cdn.simpleicons.org/amazonsagemaker/FF9900' },
  { name: 'Node.js', logo: 'https://cdn.simpleicons.org/nodedotjs/339933' },
  { name: 'Git', logo: 'https://cdn.simpleicons.org/git/F05032' },
  { name: 'GitHub', logo: 'https://cdn.simpleicons.org/github/FFFFFF' },
];

const TechLogos = () => {
  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Herramientas y Tecnologías
        </h2>
        <div className="relative">
          <HorizontalCarousel duration="30s">
            {technologies.map((tech) => (
              <li key={tech.name} className="flex items-center">
                <img src={tech.logo} alt={tech.name} className="h-10 md:h-12" />
                <span className="ml-3 text-lg font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">{tech.name}</span>
              </li>
            ))}
          </HorizontalCarousel>
        </div>
      </div>
    </div>
  );
};

export default TechLogos;
