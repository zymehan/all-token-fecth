import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Header from './components/Header';
import AdminScreen from './pages/Admin';
import UserScreen from './pages/User';

function App() {
  const [walletclick, setwalletclick] = useState(false);
  const walletConnect = () => {
    setwalletclick(true);
  }

  const walletStatus = () => {
    setwalletclick(false);
  }
  return (
    <BrowserRouter>
      <Header walletConnect={walletConnect} />
      <Routes>
        <Route path="/" element={<UserScreen walletConnect={walletclick} walletStatus={walletStatus} />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;