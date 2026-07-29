import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Estilos globales de tu aplicación
import { RouterProvider } from "react-router-dom"; // Importa el proveedor del enrutador
import { router } from "./Routes.jsx"; // Importa la configuración de rutas de tu app

// Importaciones esenciales de estilos de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

const Main = () => {
  // Si la URL del Backend de Python no está definida, muestra la pantalla de diagnóstico por defecto
  if (
    !import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_BACKEND_URL === ""
  ) {
    return (
      <React.StrictMode>
        <div className="container mt-5 text-center">
          <h2 className="text-warning">Falta configurar VITE_BACKEND_URL</h2>
          <p>
            Por favor, comprueba que tu archivo .env esté bien configurado en la
            raíz.
          </p>
        </div>
      </React.StrictMode>
    );
  }

  return (
    <React.StrictMode>
      {/* Carga el enrutador principal que gestiona páginas como Layout, Home, etc. */}
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

// Renderiza el componente principal en el contenedor 'root' del index.html
ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
