import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ExamplesCarousel = ({ examples, onSelect, title = "Prueba con un ejemplo" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!examples || examples.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? examples.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === examples.length - 1 ? 0 : prevIndex + 1));
  };

  const currentExample = examples[currentIndex];

  const handleSelect = () => {
    onSelect(currentExample.value);
  };

  return (
    <div className="w-full max-w-lg mx-auto my-8">
      <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
      <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-inner">
        
        {/* Carousel Content */}
        <div className="overflow-hidden h-40 flex items-center justify-center text-center">
          {currentExample.type === 'image' ? (
            <img src={currentExample.value} alt={currentExample.alt || 'Ejemplo'} className="max-h-full max-w-full object-contain rounded" />
          ) : (
            <p className="text-gray-800 dark:text-gray-200 text-lg px-4">
              "{currentExample.value}"
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            onClick={handlePrev}
            className="p-2 m-2 bg-white/50 dark:bg-gray-800/50 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 focus:outline-none"
          >
            <FaChevronLeft className="text-gray-800 dark:text-gray-200" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={handleNext}
            className="p-2 m-2 bg-white/50 dark:bg-gray-800/50 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 focus:outline-none"
          >
            <FaChevronRight className="text-gray-800 dark:text-gray-200" />
          </button>
        </div>
      </div>

      {/* Select Button */}
      <div className="text-center mt-4">
        <button
          onClick={handleSelect}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
        >
          Usar este ejemplo
        </button>
      </div>
    </div>
  );
};

export default ExamplesCarousel;
