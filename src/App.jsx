import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import CameraScreen from './components/CameraScreen';
import ResultScreen from './components/ResultScreen';
import BackgroundMusic from './components/BackgroundMusic';

function App() {
  const [screen, setScreen] = useState('start'); // 'start', 'camera', 'result'
  const [photos, setPhotos] = useState([]);

  const handleStart = () => {
    setScreen('camera');
  };

  const handleCaptureComplete = (capturedPhotos) => {
    setPhotos(capturedPhotos);
    setScreen('result');
  };

  const handleRestart = () => {
    setPhotos([]);
    setScreen('start');
  };

  return (
    <div className="app-container">
      <BackgroundMusic />
      {screen === 'start' && <StartScreen onStart={handleStart} />}
      {screen === 'camera' && <CameraScreen onCaptureComplete={handleCaptureComplete} />}
      {screen === 'result' && <ResultScreen photos={photos} onRestart={handleRestart} />}
    </div>
  );
}

export default App;
