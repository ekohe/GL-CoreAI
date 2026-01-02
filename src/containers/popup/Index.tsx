import React from 'react';
import { createRoot } from 'react-dom/client';
import reportWebVitals from './../../reportWebVitals';
import BrowserActionPopup from './BrowserActionPopup';

// Import necessary styles
import './../../assets/styles/popup.css';

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserActionPopup />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
