import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainSchedule from './pages/MainSchedule';
import LinkedSchedule from './pages/LinkedSchedule';
import './index.css';

function App() {
  return (
      <Routes>
        <Route path="/" element={<MainSchedule />} />
        <Route path="/linked" element={<LinkedSchedule />} />
      </Routes>
  );
}

export default App;
