import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Login } from './pages/Login';

// Placeholder for Register page if needed, or just redirect to Login for the demo
const Register = () => (
  <div className="flex items-center justify-center min-h-screen">
    Register Page Placeholder - <a href="/login" className="ml-2 text-blue-600">Go to Login</a>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  );
}

export default App;
