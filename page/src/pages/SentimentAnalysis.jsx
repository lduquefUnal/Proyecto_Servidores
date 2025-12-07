import React, { useState } from 'react';
import ProjectDetail from '../components/ProjectDetail';
import ExamplesCarousel from '../components/ExamplesCarousel';

const SentimentAnalysis = () => {
  const [text, setText] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [model, setModel] = useState('huggingface');
  const [isLoading, setIsLoading] = useState(false);

  const API_ENDPOINTS = {
    huggingface: 'https://qigfixb3zd.execute-api.us-east-1.amazonaws.com/default/predict/sentiment_hf',
    svm_countervectorizer: 'https://qigfixb3zd.execute-api.us-east-1.amazonaws.com/default/predict/sentiment_svm_cv',
    svm_tfidfvectorizer: 'https://qigfixb3zd.execute-api.us-east-1.amazonaws.com/default/predict/sentiment_svm_tfidf',
  };

  const handleClear = () => {
    setText('');
    setPrediction(null);
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Por favor, ingresa un texto para analizar.');
      return;
    }
    setIsLoading(true);
    setPrediction(null);
    try {
      const response = await fetch(API_ENDPOINTS[model], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
      });
      if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);
      const result = await response.json();
      if (result && Array.isArray(result.predictions) && result.predictions.length > 0) {
        let rawPred = result.predictions[0];
        let label = typeof rawPred === 'string' ? rawPred : (rawPred && rawPred.label);
        if (label) setPrediction({ sentiment: label.toLowerCase() });
        else console.error('Formato de predicción no reconocido:', result);
      } else {
        console.error('La respuesta de la API no tiene el formato esperado.', result);
      }
    } catch (error) {
      console.error("Error al realizar el análisis:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSentimentUI = () => {
    if (!prediction) return null;
    const sentimentInfo = {
      positivo: { emoji: '😊', text: 'Positivo', color: 'text-green-500' },
      negativo: { emoji: '😠', text: 'Negativo', color: 'text-red-500' },
      neutro: { emoji: '😐', text: 'Neutro', color: 'text-yellow-500' },
    };
    const ui = sentimentInfo[prediction.sentiment] || sentimentInfo.neutro;
    return (
      <div className="text-center transition-opacity duration-500">
        <span className="text-7xl md:text-9xl">{ui.emoji}</span>
        <p className={`text-xl md:text-2xl font-bold mt-4 ${ui.color}`}>
          {ui.text}
        </p>
      </div>
    );
  };

  const examples = [
    { type: 'text', value: '¡Qué gran día para aprender sobre machine learning!' },
    { type: 'text', value: 'El servicio al cliente fue terrible, estoy muy decepcionado.' },
    { type: 'text', value: 'El evento comenzará a las 7 de la tarde.' },
    { type: 'text', value: 'Me encanta este producto, funciona mejor de lo que esperaba.' },
  ];

  const projectDetails = {
    description: "Este proyecto implementa tres modelos de análisis de sentimientos para clasificar texto en español como positivo, negativo o neutro. El primer modelo utiliza 'pysentimiento', una librería basada en Transformers (RoBERTuito) ajustada para el español. Los otros dos son modelos clásicos de Machine Learning (SVM) que usan representaciones de texto basadas en Count Vectorizer y TF-IDF, respectivamente. Todos los modelos están desplegados como endpoints en AWS SageMaker, accesibles a través de API Gateway.",
    metrics: [
      { name: "Modelo Principal", value: "RoBERTuito (HF)" },
      { name: "Accuracy (SVM-CV)", value: "≈85%" },
      { name: "Accuracy (SVM-TFIDF)", value: "≈86%" },
      { name: "Idioma", value: "Español" },
    ],
    links: [
      { name: "Notebook", url: "https://github.com/luisduquef/servidores/blob/main/Analisis%20de%20sentimientos.ipynb", icon: "Notebook" },
      { name: "Source Code (HF)", url: "https://github.com/luisduquef/servidores/tree/main/modelos/sentimientos/model_pysentimiento/code", icon: "Source Code" },
      { name: "Source Code (SVM)", url: "https://github.com/luisduquef/servidores/tree/main/modelos/sentimientos/svm_countvectorizer/code", icon: "Source Code" },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      
      {/* --- Main Analysis UI --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Analiza el Sentimiento de un Texto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Area */}
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
              placeholder="Escribe o pega tu texto aquí..."
            />
            <div className="flex items-center space-x-4 mt-4">
              <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || !text.trim()}>
                {isLoading ? 'Analizando...' : 'Analizar Sentimiento'}
              </button>
              <button onClick={handleClear} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
                Borrar
              </button>
            </div>
          </div>
          {/* Output Area */}
          <div className="flex flex-col">
             <div className="flex items-center mb-4">
                <label htmlFor="model-select" className="mr-2 font-medium text-gray-700 dark:text-gray-300">Modelo:</label>
                <select id="model-select" value={model} onChange={(e) => setModel(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="huggingface">Moderno (RoBERTuito)</option>
                  <option value="svm_countervectorizer">Clásico (SVM + CV)</option>
                  <option value="svm_tfidfvectorizer">Clásico (SVM + TFIDF)</option>
                </select>
             </div>
            <div className="flex-grow flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900/50 rounded-lg min-h-[18rem] p-4">
              {isLoading && <div className="text-xl text-gray-500 dark:text-gray-400">Analizando...</div>}
              {!isLoading && !prediction && <div className="text-xl text-gray-500 dark:text-gray-400 text-center">El resultado del análisis aparecerá aquí.</div>}
              {!isLoading && prediction && getSentimentUI()}
            </div>
          </div>
        </div>
      </div>

      {/* --- Examples Carousel --- */}
      <ExamplesCarousel examples={examples} onSelect={(exampleText) => setText(exampleText)} />

      {/* --- Project Details --- */}
      <ProjectDetail details={projectDetails} />

    </div>
  );
};

export default SentimentAnalysis;