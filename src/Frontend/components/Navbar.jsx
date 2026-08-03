import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"; // Ajusta la ruta si es necesario
import { toast } from "react-toastify";

export const Navbar = () => {
  // 📥 Extraemos store y la función unificada handleLogout desde el estado global
  const { store, handleLogout } = useGlobalReducer();
  const navigate = useNavigate();

  const clickLogout = () => {
    handleLogout(); // 1. Ejecuta el borrado de localStorage, Reducer y abre el modal
    toast.info("Sesión cerrada correctamente"); // 2. Muestra la notificación visual
    navigate("/"); // 3. Redirige a la página de inicio por seguridad
  };

  // 🌟 FUNCIÓN PARA ABRIR EL MODAL DE MANERA SEGURA EN REACT
  const abrirLoginModal = () => {
    const modalElement = document.getElementById("loginModal");

    if (modalElement) {
      if (window.bootstrap && window.bootstrap.Modal) {
        const modalInstance =
          window.bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
      } else {
        console.error(
          "Bootstrap JS no está disponible en 'window.bootstrap'. Revisa tu index.html.",
        );
      }
    }
  };

  const abrirSignupModal = () => {
    const modalElement = document.getElementById("signupModal");

    if (modalElement) {
      if (window.bootstrap && window.bootstrap.Modal) {
        const modalInstance =
          window.bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
      } else {
        console.error(
          "Bootstrap JS no está disponible en 'window.bootstrap'. Revisa tu index.html.",
        );
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        {/* Logo o Nombre de la app */}
        <Link to="/" className="navbar-brand font-weight-bold">
          🚀 Mi Aplicación
        </Link>

        <div className="d-flex align-items-center">
          {/* RENDERIZADO CONDICIONAL: Evaluamos si existe un token en la tienda global */}
          {!store.token ? (
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-light btn-sm"
                onClick={abrirLoginModal}
              >
                Iniciar Sesión
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={abrirSignupModal}
              >
                Registrarse
              </button>
            </div>
          ) : (
            // Opción B: El usuario SÍ está autenticado -> Mostramos botón de Cerrar Sesión
            <div className="d-flex align-items-center gap-3">
              {store.user && (
                <span className="text-light me-2">
                  ¡Hola, {store.user.name}!
                </span>
              )}
              <button className="btn btn-danger btn-sm" onClick={clickLogout}>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
