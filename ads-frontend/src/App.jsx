/**
 * ADS Inteligente - Frontend Principal
 * React 18 + Tailwind CSS (Minimalista)
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Performance from './pages/Performance';
import Optimize from './pages/Optimize';
import Budget from './pages/Budget';
import Settings from './pages/Settings';
import AiChat from './pages/AiChat';
import Login from './pages/Login';

// Context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota de Login */}
            <Route path="/login" element={<Login />} />

            {/* Rotas Autenticadas */}
            <Route
              path="/*"
              element={
                <div className="flex h-screen bg-slate-900 text-slate-100">
                  {/* Sidebar */}
                  <Sidebar />

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Navbar */}
                    <Navbar />

                    {/* Content */}
                    <main className="flex-1 overflow-auto p-6">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/campaigns" element={<Campaigns />} />
                        <Route path="/performance" element={<Performance />} />
                        <Route path="/optimize" element={<Optimize />} />
                        <Route path="/budget" element={<Budget />} />
                        <Route path="/ai-chat" element={<AiChat />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
