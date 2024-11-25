import React from 'react';
import { createRoot } from 'react-dom/client';
import reportWebVitals from './../../reportWebVitals';
import AppSettings from './AppSettings';

import './../../assets/styles/settings.css';
import { FormProvider } from './../../contexts/FormContext';

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <FormProvider>
        <AppSettings />
      </FormProvider>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
