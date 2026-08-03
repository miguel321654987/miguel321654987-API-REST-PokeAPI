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
            // Opción A: El usuario NO está autenticado -> Mostramos botón para abrir el Modal
            <button
              className="btn btn-outline-light btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#loginModal"
            >
              Iniciar Sesión
            </button>
          ) : (
            // Opción B: El usuario SÍ está autenticado -> Mostramos botón de Cerrar Sesión
            <div className="d-flex align-items-center gap-3">
              {/* Si guardas el nombre del usuario en el store, puedes mostrarlo aquí */}
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
