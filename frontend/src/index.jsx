// PASSO 1: TODAS as importações de módulos vêm primeiro.
import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import App from "./App.jsx";
import { AuthProvider } from "./context/Auth/AuthContext.jsx"; 
import './index.css';

// Polyfill para process no Vite (evita erro de undefined)
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
  window.process = { env: {} };
}

// PASSO 3: O resto do código permanece o mesmo, usando o nome correto <AuthProvider>.
ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <CssBaseline />
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);