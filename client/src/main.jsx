import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'border border-gray-200 bg-white text-gray-900',
            title: 'text-sm font-medium',
            description: 'text-sm text-gray-600'
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
