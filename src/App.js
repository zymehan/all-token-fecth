import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Header from './components/Header';
import AdminScreen from './pages/Admin';
import UserScreen from './pages/User';

function App() {

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<UserScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;