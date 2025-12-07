import React, { useRef, useState, useEffect } from 'react';
import ProjectDetail from '../components/ProjectDetail';
import ExamplesCarousel from '../components/ExamplesCarousel';
import exampleDigitImg from '../assets/digit.png'; // Using an example digit image from assets

const DigitRecognizer = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [model, setModel] = useState('clasico');
  const [isLoading, setIsLoading] = useState(false);

  const API_ENDPOINTS = {
    clasico: 'https://qigfixb3zd.execute-api.us-east-1.amazonaws.com/default/predict/mnist_classical',
    hibrido: 'https://qigfixb3zd.execute-api.us-east-1.amazonaws.com/default/predict/mnist_hybrid',
  };

  const getContext = () => canvasRef.current.getContext('2d');

  useEffect(() => {
    const context = getContext();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'white';
    context.lineWidth = 18;
    clearCanvas();
  }, []);

  const getCoords = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches && event.touches[0];
    return {
      offsetX: (touch ? touch.clientX : event.clientX) - rect.left,
      offsetY: (touch ? touch.clientY : event.clientY) - rect.top,
    };
  };

  const startDrawing = (event) => {
    const { offsetX, offsetY } = getCoords(event);
    getContext().beginPath();
    getContext().moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    getContext().closePath();
    setIsDrawing(false);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    event.preventDefault();
    const { offsetX, offsetY } = getCoords(event);
    getContext().lineTo(offsetX, offsetY);
    getContext().stroke();
  };

  const clearCanvas = () => {
    const context = getContext();
    context.fillStyle = 'black';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    setPredictions([]);
  };

  const loadAndDrawImage = (imageUrl) => {
    clearCanvas();
    const context = getContext();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      // Scale image to fit canvas
      context.drawImage(img, 0, 0, context.canvas.width, context.canvas.height);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setPredictions([]);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvasRef.current, 0, 0, 28, 28);
    const base64Image = tempCanvas.toDataURL('image/png').split(',')[1];

    try {
      const response = await fetch(API_ENDPOINTS[model], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: base64Image }),
      });
      if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);
      const result = await response.json();
      const probabilities = result?.probabilities;
      if (!Array.isArray(probabilities)) {
        console.error("La respuesta no contiene 'probabilities'");
        setPredictions([]);
        return;
      }
      const top3 = probabilities
        .map((prob, index) => ({ digit: index, probability: parseFloat(prob) }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 3);
      setPredictions(top3);
    } catch (error) {
      console.error("Error al realizar la predicción:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const examples = [
    { type: 'image', value: exampleDigitImg, alt: 'Número 7 de ejemplo' },
    // You can add more images here if you have them in your assets
    // { type: 'image', value: exampleDigitImg2, alt: 'Número 2 de ejemplo' },
  ];

  const projectDetails = {
    description: "Este proyecto compara un modelo de Red Neuronal Convolucional (CNN) clásico con un modelo híbrido Cuántico-Clásico para el reconocimiento de dígitos manuscritos del dataset MNIST. El modelo clásico es una CNN estándar. El modelo híbrido reemplaza la última capa densa de la CNN con un circuito cuántico variacional, explorando el potencial de la computación cuántica para tareas de machine learning. Ambos modelos están desplegados en AWS SageMaker.",
    metrics: [
      { name: "Dataset", value: "MNIST" },
      { name: "Modelo Clásico", value: "CNN" },
      { name: "Modelo Híbrido", value: "CNN + Circuito Cuántico" },
      { name: "Accuracy (Clásico)", value: "≈99.2%" },
      { name: "Accuracy (Híbrido)", value: "≈98.5%" },
    ],
    links: [
      { name: "Notebook (Híbrido)", url: "https://github.com/luisduquef/servidores/blob/main/red_hibrida.ipynb", icon: "Notebook" },
      { name: "Source Code (Clásico)", url: "https://github.com/luisduquef/servidores/tree/main/modelos/mnist/mnist_classical/code", icon: "Source Code" },
      { name: "Source Code (Híbrido)", url: "https://github.com/luisduquef/servidores/tree/main/modelos/mnist/mnist_quantum/code", icon: "Source Code" },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Reconocedor de Dígitos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Canvas */}
          <div className="w-full">
            <h3 className="text-xl font-semibold text-center mb-2 dark:text-white">Dibuja un dígito (0-9)</h3>
            <canvas
              ref={canvasRef}
              width="280"
              height="280"
              className="bg-black rounded-md cursor-crosshair mx-auto touch-none shadow-inner"
              onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onMouseMove={draw}
              onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw}
            />
          </div>
          {/* Predictions */}
          <div className="w-full">
            <h3 className="text-xl font-semibold text-center mb-2 dark:text-white">Predicción del Modelo</h3>
            <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900/50 rounded-lg h-[280px] p-4">
              {isLoading && <div className="text-xl text-gray-500 dark:text-gray-400">Analizando...</div>}
              {!isLoading && predictions.length === 0 && <div className="text-xl text-gray-500 dark:text-gray-400">Esperando un dígito...</div>}
              {!isLoading && predictions.length > 0 && (
                <div className="flex items-end justify-center w-full space-x-4">
                  {predictions[1] && <div className="text-center"><span className="text-6xl font-bold text-gray-400 dark:text-gray-500">{predictions[1].digit}</span><p className="text-sm text-gray-500">{(predictions[1].probability * 100).toFixed(1)}%</p></div>}
                  {predictions[0] && <div className="text-center"><span className="text-9xl font-bold text-indigo-600 dark:text-indigo-400">{predictions[0].digit}</span><p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{(predictions[0].probability * 100).toFixed(1)}%</p></div>}
                  {predictions[2] && <div className="text-center"><span className="text-6xl font-bold text-gray-400 dark:text-gray-500">{predictions[2].digit}</span><p className="text-sm text-gray-500">{(predictions[2].probability * 100).toFixed(1)}%</p></div>}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center flex-wrap gap-4 mt-6">
          <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50" disabled={isLoading}>
            {isLoading ? 'Reconociendo...' : 'Reconocer Dígito'}
          </button>
          <button onClick={clearCanvas} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
            Borrar
          </button>
          <div className="flex items-center">
            <label htmlFor="model-select-digit" className="mr-2 font-medium text-gray-700 dark:text-gray-300">Modelo:</label>
            <select id="model-select-digit" value={model} onChange={(e) => setModel(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
              <option value="clasico">Clásico (CNN)</option>
              <option value="hibrido">Híbrido (CNN + Quantum)</option>
            </select>
          </div>
        </div>
      </div>
      
      <ExamplesCarousel examples={examples} onSelect={loadAndDrawImage} title="Prueba con una imagen de ejemplo" />
      
      <ProjectDetail details={projectDetails} />

    </div>
  );
};

export default DigitRecognizer;