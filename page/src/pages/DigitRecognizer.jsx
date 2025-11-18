import React, { useRef, useState, useEffect } from 'react';

const DigitRecognizer = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // Función para obtener el contexto del canvas
  const getContext = () => canvasRef.current.getContext('2d');

  // Configura el canvas cuando el componente se monta
  useEffect(() => {
    const context = getContext();
    context.fillStyle = 'black';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'white';
    context.lineWidth = 18; // Un grosor bueno para dibujar dígitos
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const context = getContext();
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    const context = getContext();
    context.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const context = getContext();
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const clearCanvas = () => {
    const context = getContext();
    context.fillStyle = 'black';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    setPrediction(null); // Limpiamos la predicción anterior
  };

  const handleSubmit = () => {
    // Aquí es donde enviarías la imagen a tu modelo de IA.
    // Por ahora, simularemos una predicción.
    console.log("Enviando imagen para predicción...");
    // const imageData = canvasRef.current.toDataURL('image/png');
    // Lógica de envío a un backend o lambda...

    // Simulación de respuesta
    setTimeout(() => {
      const randomDigit = Math.floor(Math.random() * 10);
      setPrediction(randomDigit);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Sección 1: Canvas para dibujar */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Dibuja un dígito (0-9)</h2>
        <canvas
          ref={canvasRef}
          width="280"
          height="280"
          className="bg-black rounded-md cursor-crosshair mx-auto"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={draw}
        />
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={clearCanvas}
            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
          >
            Borrar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Sección 2: Pronóstico */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Pronóstico del Modelo</h2>
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-56">
          {prediction !== null ? (
            <span className="text-9xl font-bold text-indigo-600">{prediction}</span>
          ) : (
            <span className="text-xl text-gray-500">Esperando un dígito...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitRecognizer;