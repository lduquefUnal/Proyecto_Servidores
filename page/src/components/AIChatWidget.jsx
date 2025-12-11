import React, { useEffect, useRef, useState } from 'react';
import {
  FaChalkboardTeacher,
  FaComments,
  FaImage,
  FaPaperPlane,
  FaRobot,
  FaRedoAlt,
  FaSmile,
  FaTimes,
} from 'react-icons/fa';

const starterTopics = [
  {
    title: 'computación cuántica y qubits',
    questions: [
      '¿Te gustaría ver cómo se representa un qubit en la esfera de Bloch?',
      '¿Probamos a armar un circuito con puertas Hadamard y CNOT?',
      '¿Quieres comparar decoherencia vs ruido clásico?',
    ],
  },
  {
    title: 'servicios de AWS en la nube',
    questions: [
      '¿Te muestro cómo montar un backend serverless rápido?',
      '¿Vemos cómo asegurar buckets S3 con políticas mínimas?',
      '¿Hacemos un plan para desplegar con ECS/Fargate?',
    ],
  },
  {
    title: 'algoritmos de machine learning',
    questions: [
      '¿Comparamos regresión lineal vs árboles para un caso sencillo?',
      '¿Exploramos cómo tunear hiperparámetros con grid o bayesiano?',
      '¿Quieres revisar cómo evitar overfitting con regularización?',
    ],
  },
  {
    title: 'trucos con ESP32',
    questions: [
      '¿Te enseño a leer sensores y mandar datos por WiFi en minutos?',
      '¿Probamos deep-sleep para ahorrar batería?',
      '¿Hacemos un mini servidor web para controlar LEDs?',
    ],
  },
  {
    title: 'proyectos con Arduino',
    questions: [
      '¿Armamos un plan para un robot evita-obstáculos?',
      '¿Quieres aprender a usar PWM para motores o LEDs?',
      '¿Vemos cómo leer múltiples sensores analógicos con poco ruido?',
    ],
  },
  {
    title: 'física divertida',
    questions: [
      '¿Te interesa repasar relatividad en 3 ideas clave?',
      '¿Hablamos de por qué cae una pluma al vacío igual que un martillo?',
      '¿Quieres ejemplos rápidos de conservación de energía y momento?',
    ],
  },
  {
    title: 'gramática en inglés',
    questions: [
      '¿Practicamos tiempos verbales con ejemplos cortos?',
      '¿Quieres tips para evitar errores comunes con preposiciones?',
      '¿Te paso frases útiles para sonar más natural?',
    ],
  },
  {
    title: 'estoicismo práctico',
    questions: [
      '¿Probamos un ejercicio breve de dicotomía de control?',
      '¿Te comparto 3 frases de Epicteto con aplicación diaria?',
      '¿Hacemos un plan de journaling en 2 minutos?',
    ],
  },
  {
    title: 'redes neuronales y IA',
    questions: [
      '¿Quieres comparar CNNs vs transformers en pocas líneas?',
      '¿Vemos cómo elegir función de pérdida según la tarea?',
      '¿Te muestro un flujo rápido de entrenamiento y validación?',
    ],
  },
  {
    title: 'consejos de estudio',
    questions: [
      '¿Te interesa una rutina Pomodoro corta para hoy?',
      '¿Quieres tips para notas tipo Cornell en 3 pasos?',
      '¿Vemos cómo espaciar repasos para recordar más?',
    ],
  },
  {
    title: 'IA generativa y prompts',
    questions: [
      '¿Probamos un framework corto para escribir mejores prompts?',
      '¿Quieres ver cómo estructurar few-shot vs zero-shot?',
      '¿Hablamos de cómo evaluar salidas sin dataset grande?',
    ],
  },
  {
    title: 'optimización de código en Python',
    questions: [
      '¿Medimos rendimiento con timeit y perfilador simple?',
      '¿Te muestro trucos con vectorización en NumPy?',
      '¿Quieres comparar multiproceso vs async para IO?',
    ],
  },
  {
    title: 'ciberseguridad básica',
    questions: [
      '¿Vemos prácticas rápidas para contraseñas y 2FA?',
      '¿Quieres tips para detectar phishing?',
      '¿Hablamos de cómo cifrar y respaldar datos personales?',
    ],
  },
  {
    title: 'bases de datos y SQL',
    questions: [
      '¿Te enseño índices y consultas rápidas en 3 ejemplos?',
      '¿Probamos joins con un mini caso práctico?',
      '¿Vemos cómo normalizar sin complicarnos?',
    ],
  },
  {
    title: 'control de versiones con Git',
    questions: [
      '¿Te explico ramas y merges con un flujo simple?',
      '¿Quieres atajos para revertir sin miedo?',
      '¿Hacemos un plan de branching para tu equipo?',
    ],
  },
];

const buildSystemPrompt = (mode) => {
  const shared = `Responde en español en 3 a 5 frases cortas separadas por saltos de línea o viñetas.
Sé abierto a cualquier tema, con humor ligero y cercanía de amigo de confianza.
Limita tus respuestas a ~90 palabras; casi nunca pases de 150. Si lo necesitas, usa metáforas o resúmenes.
Mantén las ideas compactas y termina con 1 o 2 preguntas para seguir conversando.
Si hay una imagen adjunta, menciónala como contexto visual aunque no puedas verla. Usa emojis con moderación.`;

  const tone =
    mode === 'profesor'
      ? 'Modo profesor: especializado en computación cuántica (qubits), AWS (servicios cloud), machine learning, IA y algoritmos, ESP32, Arduino, física, gramática en inglés y estoicismo. Tono didáctico, estructura en pasos breves, ejemplos simples y llamados a la acción. Inicia proponiendo un tema aleatorio de esas áreas, pero permanece abierto a cualquier otro tema.'
      : 'Modo amigo: tono empático, validando emociones, apoyo emocional y comentarios cercanos. Propón al inicio algún tema ligero y cambia de rumbo si la persona lo desea. motivalo a seguir conversando con preguntas abiertas. pero a veces puedes decir cosas absurdas para que se rian con sus ocurrencias , por ejemplo "aconseja volver con el ex" o "comer helado en el desayuno".';

  return `${shared}\n${tone}`;
};

const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_API_URL || '/bedrock-chat/chat';

const buildStarterMessage = () => {
  const topicObj = starterTopics[Math.floor(Math.random() * starterTopics.length)];
  const question =
    topicObj.questions?.[Math.floor(Math.random() * topicObj.questions.length)] ||
    '¿Quieres que arranquemos por ahí o prefieres otro tema?';
  return {
    text: `¡Hola! Se me antoja que conversemos sobre ${topicObj.title}. ${question}`,
    topic: topicObj.title,
  };
};

const AIChatWidget = () => {
  const [starter, setStarter] = useState(() => buildStarterMessage());
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      content: starter.text,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('amigo');
  const [attachedImage, setAttachedImage] = useState(null);
  const [lastTopic, setLastTopic] = useState(starter.topic);
  const messagesEndRef = useRef(null);

  const formatMessage = (text) => {
    if (!text) return [];
    return text
      .replace(/(\d+[.\)]\s+)/g, '\n$1')
      .replace(/([•-]\s+)/g, '\n$1')
      .replace(/([.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/g, '$1\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  };

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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage({ name: file.name, dataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const resetChat = () => {
    const fresh = buildStarterMessage();
    setStarter(fresh);
    setMessages([{ role: 'assistant', content: fresh.text }]);
    setLastTopic(fresh.topic);
    setInput('');
    setAttachedImage(null);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const imagePayload = attachedImage;
    const userMessage = {
      role: 'user',
      content: trimmed,
      image: imagePayload?.dataUrl,
      imageName: imagePayload?.name,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(mode);
      const imageContext = imagePayload
        ? `\nContexto visual: ${imagePayload.name}. Si puedes, usa el campo imageData para razonarlo.`
        : '';
      const topicContext = lastTopic
        ? `\nÚltimo tema propuesto: ${lastTopic}. Si el usuario dice "sí", "dale", "continúa" o similar sin más contexto, continúa explicando ese tema con un mini resumen (max ~90 palabras).`
        : '';

      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${systemPrompt}${topicContext}${imageContext}\n\nUsuario: ${trimmed}\nAsistente:`,
          mode,
          imageName: imagePayload?.name,
          imageData: imagePayload?.dataUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener respuesta');
      }

      const data = await response.json();
      const reply = data.response || data.message || 'No pude responder, intenta de nuevo.';
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
                <p className="text-sm font-semibold">Chat IA cercano</p>
                <p className="text-xs opacity-80">
                  {mode === 'profesor' ? 'Modo profesor' : 'Modo amigo'}
                </p>
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

          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs">
            <div className="flex bg-white/70 dark:bg-gray-900/40 rounded-full p-1 space-x-1">
              <button
                type="button"
                onClick={() => setMode('profesor')}
                className={`flex items-center space-x-1 rounded-full px-3 py-1 transition ${
                  mode === 'profesor'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                <FaChalkboardTeacher size={12} />
                <span>Profesor</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('amigo')}
                className={`flex items-center space-x-1 rounded-full px-3 py-1 transition ${
                  mode === 'amigo'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                <FaSmile size={12} />
                <span>Amigo</span>
              </button>
            </div>
            <button
              type="button"
              onClick={resetChat}
              className="flex items-center space-x-1 rounded-full px-3 py-1 bg-white/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition"
            >
              <FaRedoAlt size={12} />
              <span>Resetear chat</span>
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
                  {formatMessage(message.content).map((line, lineIndex) => (
                    <p key={lineIndex} className="mb-1 last:mb-0">
                      {line}
                    </p>
                  ))}
                  {message.image && (
                    <div className="mt-2 space-y-1">
                      <img
                        src={message.image}
                        alt={message.imageName || 'Imagen adjunta'}
                        className="max-h-40 rounded-lg border border-white/30 dark:border-gray-700"
                      />
                      {message.imageName && (
                        <p className="text-[10px] opacity-80">Imagen: {message.imageName}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-gray-500 dark:text-gray-400">Pensando...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {attachedImage && (
            <div className="flex items-center justify-between px-4 text-xs text-gray-700 dark:text-gray-200">
              <div className="flex items-center space-x-2 truncate">
                <FaImage size={12} />
                <span className="truncate">{attachedImage.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
                aria-label="Quitar imagen"
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="chat-image"
                className="cursor-pointer rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Adjuntar imagen"
              >
                <FaImage size={14} />
              </label>
              <input
                id="chat-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'profesor'
                    ? 'Pregunta o tema para aprender...'
                    : 'Cuéntame qué pasa o qué quieres charlar...'
                }
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
