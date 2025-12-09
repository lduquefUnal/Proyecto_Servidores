import React, { useEffect, useRef, useState } from 'react';
import { FaComments, FaPaperPlane, FaRobot, FaTimes } from 'react-icons/fa';

const systemPrompt = `Eres un asistente experto en Machine Learning y Deep Learning.
Te enfocas en teoría: descenso de gradiente y sus variantes, funciones de pérdida, optimización,
arquitecturas de redes neuronales profundas, regularización y técnicas de entrenamiento.
Responde de forma clara y concisa, sin inventar datos ni salirte de estos temas. eres un asistente de chat virtual tus respuestas deben ser resumidas y orientadas  a un usuario final (usa iconos) , evitando tecnicismos innecesarios. luego le preguntas que si quiere saber algo más o le propones un tema , todo como un asistente, chatbot experto en ml, redes neuronales,pytorch ,cuda -q para computación cuantica y compuertas cuanticas .`;

const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_API_URL || '/bedrock-chat/chat';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hola, soy tu asistente de IA para dudas conceptuales de ML , arquitectura de redes neuronales , computación cuántica y servicios de aws. ¿Qué quieres repasar hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const typeReply = (fullText) => {
    const minDuration = 300;
    const maxDuration = 2000;
    const duration = Math.min(maxDuration, Math.max(minDuration, fullText.length * 20));
    const step = Math.max(15, Math.floor(duration / Math.max(1, fullText.length)));
    let index = 0;

    const timer = setInterval(() => {
      index += 1;
      const nextText = fullText.slice(0, index);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex]?.role === 'assistant') {
          updated[lastIndex] = { ...updated[lastIndex], content: nextText };
        }
        return updated;
      });
      if (index >= fullText.length) {
        clearInterval(timer);
      }
    }, step);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${systemPrompt}\n\nUsuario: ${trimmed}\nAsistente:`,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener respuesta');
      }

      const data = await response.json();
      const reply = data.response || data.message || 'No pude responder, intenta de nuevo.';
      // Añadimos el mensaje vacío del asistente y lo vamos completando
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      typeReply(reply);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'No pude conectar con la API. Verifica tu backend de Bedrock y vuelve a intentar.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-indigo-600 text-white p-4 shadow-2xl hover:bg-indigo-700 transition"
        aria-label="Abrir chat de IA"
      >
        {isOpen ? <FaTimes size={22} /> : <FaComments size={22} />}
      </button>

      {/* Panel del chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[70vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white">
            <div className="flex items-center space-x-2">
              <FaRobot />
              <div>
                <p className="text-sm font-semibold">Asistente ML</p>
                <p className="text-xs opacity-80">Teoría de redes neuronales</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Cerrar chat"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 leading-relaxed ${
                    message.role === 'assistant'
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-gray-500 dark:text-gray-400">Pensando...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre ML..."
                className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-indigo-600 text-white p-2 hover:bg-indigo-700 disabled:opacity-50"
                aria-label="Enviar"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
