import React, { useState, useRef, useMemo } from 'react';
import ProjectDetail from '../components/ProjectDetail';
import ExamplesCarousel from '../components/ExamplesCarousel';
import { FaUpload, FaTimes } from 'react-icons/fa';

const shuffleArray = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const s3Examples = [
  {
    type: 'image',
    value: 'https://test-data-model-sagemaker.s3.us-east-1.amazonaws.com/neumonia_test_data/NORMAL/NORMAL2-IM-0045-0001.jpeg',
    alt: 'Radiografía de tórax normal',
    label: 'NORMAL2-IM-0045-0001.jpeg',
  },
  {
    type: 'image',
    value: 'https://test-data-model-sagemaker.s3.us-east-1.amazonaws.com/neumonia_test_data/PNEUMONIA/person102_bacteria_487.jpeg',
    alt: 'Radiografía de tórax con neumonía',
    label: 'person102_bacteria_487.jpeg',
  },
];

const UnderConstructionBanner = ({ onDismiss }) => (
  <div className="absolute inset-x-0 top-0 bg-yellow-400/80 dark:bg-yellow-600/80 backdrop-blur-sm text-center p-4 z-50 flex items-center justify-center shadow-lg">
    <p className="font-semibold text-gray-800 dark:text-white">
      Esta página está en construcción. La lógica de la API aún no está conectada.
    </p>
    <button onClick={onDismiss} className="ml-4 text-gray-800 dark:text-white hover:scale-125 transition-transform">
      <FaTimes />
    </button>
  </div>
);

const PneumoniaDetector = () => {
  const [showBanner, setShowBanner] = useState(true);
  const [image, setImage] = useState(null); // Stores the selected image file or URL
  const [imagePreview, setImagePreview] = useState(null); // Stores the data URL for preview
  const [prediction, setPrediction] = useState(null); // e.g., { result: 'Neumonía', confidence: 0.95 }
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setPrediction(null);
    }
  };
  
  const loadImageFromUrl = async (url) => {
    setImagePreview(url);
    setPrediction(null);
    // In a real scenario, you'd convert this URL to a file/base64 to send to the API
    // For now, we just set it for preview.
    const response = await fetch(url);
    const blob = await response.blob();
    setImage(new File([blob], "example.jpg", { type: blob.type }));
  };


  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setPrediction(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      alert('Por favor, sube una imagen de una radiografía.');
      return;
    }
    setIsLoading(true);
    setPrediction(null);

    // --- MOCK API CALL ---
    // Replace this with your actual API call
    console.log("Enviando imagen al (mock) endpoint...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    // Simulate a random prediction
    const mockPrediction = Math.random() > 0.5 
      ? { result: 'Neumonía', confidence: Math.random() * (0.99 - 0.8) + 0.8 }
      : { result: 'Normal', confidence: Math.random() * (0.99 - 0.8) + 0.8 };
    
    setPrediction(mockPrediction);
    console.log("Predicción (mock) recibida:", mockPrediction);
    // --- END MOCK API CALL ---

    setIsLoading(false);
  };
  
  const getPredictionUI = () => {
    if(!prediction) return null;
    const isPneumonia = prediction.result === 'Neumonía';
    return (
      <div className="text-center">
        <p className={`text-3xl font-bold ${isPneumonia ? 'text-red-500' : 'text-green-500'}`}>
          {prediction.result}
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
          Confianza: <span className="font-semibold">{ (prediction.confidence * 100).toFixed(1) }%</span>
        </p>
      </div>
    );
  };

  const examples = useMemo(() => shuffleArray(s3Examples), []);

  const projectDetails = {
    description: "Este modelo es una Red Neuronal Convolucional (CNN), posiblemente una arquitectura como ResNet o VGG, entrenada para identificar patrones de neumonía en imágenes de radiografías de tórax pediátricas. El objetivo es asistir a los profesionales de la salud en el diagnóstico temprano. El modelo fue entrenado con un dataset público de Kaggle y desplegado en AWS para inferencia.",
    metrics: [
      { name: "Arquitectura", value: "CNN (ResNet-based)" },
      { name: "Dataset", value: "Chest X-Ray (Kaggle)" },
      { name: "Accuracy", value: "≈81%" },
      { name: "Clases", value: "Neumonía / Normal" },
    ],
    links: [
      { name: "Notebook", url: "https://github.com/luisduquef/servidores/blob/main/IDENTIFICACI%C3%93N_DE_NEUMON%C3%8DA_EN_INFANTES%20(1).ipynb", icon: "Notebook" },
      // Update with the correct code path when available
      { name: "Source Code", url: "#", icon: "Source Code" },
    ],
  };

  return (
    <div className="relative container mx-auto px-4 py-8 space-y-12">
      {showBanner && <UnderConstructionBanner onDismiss={() => setShowBanner(false)} />}
      
      {/* --- Main UI --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Detector de Neumonía en Radiografías</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image Uploader */}
          <div className="flex flex-col items-center">
            <div 
              className="w-full h-72 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Vista previa" className="max-h-full max-w-full object-contain rounded-md" />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <FaUpload className="mx-auto text-4xl mb-2" />
                  <p>Haz clic para subir una imagen</p>
                  <p className="text-sm">(o selecciona un ejemplo abajo)</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg, image/png" className="hidden" />
          </div>

          {/* Prediction Output */}
          <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900/50 rounded-lg h-72 p-4">
            {isLoading && <div className="text-xl text-gray-500 dark:text-gray-400">Analizando...</div>}
            {!isLoading && !prediction && <div className="text-xl text-gray-500 dark:text-gray-400">Esperando imagen...</div>}
            {!isLoading && prediction && getPredictionUI()}
          </div>
        </div>
        <div className="flex justify-center items-center flex-wrap gap-4 mt-6">
          <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50" disabled={isLoading || !image}>
            {isLoading ? 'Analizando...' : 'Analizar Imagen'}
          </button>
          <button onClick={clearImage} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
            Limpiar
          </button>
        </div>
      </div>

      <ExamplesCarousel examples={examples} onSelect={loadImageFromUrl} title="Prueba con una imagen de ejemplo"/>
      
      <ProjectDetail details={projectDetails} />
    </div>
  );
};

export default PneumoniaDetector;
