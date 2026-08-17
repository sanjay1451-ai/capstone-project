import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Home />
      </div>
    </AuthProvider>
  );
}

export default App;
