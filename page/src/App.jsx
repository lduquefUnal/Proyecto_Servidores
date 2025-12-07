import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout'; // Importamos el Layout
import Home from './pages/Home';
import DigitRecognizer from './pages/DigitRecognizer';
import SentimentAnalysis from './pages/SentimentAnalysis';
import AboutUs from './pages/AboutUs';
import PneumoniaDetector from './pages/PneumoniaDetector';

function App() {
  return (
    // 1. BrowserRouter envuelve TODO. Es el que habilita la magia del enrutamiento.
    <BrowserRouter>
      {/* 2. Layout envuelve las Rutas para que el Header y Footer 
              siempre estén visibles. */}
      <Layout>
        {/* 3. Routes es el "controlador de tráfico" que mira la URL. */}
        <Routes>
          {/* 4. Esta es la Ruta 1 (la principal). 
                 Si la URL es "/", muestra el componente <Home /> */}
          <Route path="/" element={<Home />} />

          {/* 5. Esta es la Ruta 2. 
                 Si la URL es "/reconocedor-digitos", muestra el componente... */}
          <Route 
            path="/reconocedor-digitos"
            element={<DigitRecognizer />}
          />

          {/* 6. Esta es la Ruta 3. */}
          <Route 
            path="/detector-neumonia" 
            element={<PneumoniaDetector />} 
          />

          {/* 7. Esta es la Ruta 4. */}
          <Route 
            path="/analisis-sentimiento" 
            element={<SentimentAnalysis />} 
          />

          {/* 8. Esta es la Ruta 5. */}
          <Route 
            path="/quienes-somos" 
            element={<AboutUs />} 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;