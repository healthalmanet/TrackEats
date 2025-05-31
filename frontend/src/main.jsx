import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './components/context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(



  <BrowserRouter>

  <AuthProvider>
    <App />
  </AuthProvider>
  </BrowserRouter>
    
  
);
