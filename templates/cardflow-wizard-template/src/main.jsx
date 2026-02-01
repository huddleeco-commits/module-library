/**
 * CardFlow Wizard Template
 * React application entry point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global styles
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #0f0f1a;
    color: #fff;
  }

  input::placeholder {
    color: #666;
  }

  input:focus {
    border-color: #6366f1 !important;
  }

  button:hover {
    opacity: 0.9;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;
document.head.appendChild(globalStyles);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
