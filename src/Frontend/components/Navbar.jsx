import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { toast } from "react-toastify";

export const Navbar = () => {
  // 📥 Extraemos 'store' y 'actions' desde nuestro hook global unificado
  const { store, actions } = useGlobalReducer();
  const navigate = useNavigate();

  const clickLogout = () => {
    // 1. Ejecuta el flujo centralizado de actions.js (borra token, hace dispatch y abre el modal)
    actions.handleLogout();

    // 2. Muestra la notificación visual
    toast.info("Sesión cerrada correctamente");

    // 3. Redirige a la página de inicio por seguridad
    navigate("/");
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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid d-flex justify-content-between">
        <Link to="/" className="navbar-brand font-weight-bold">
          🚀 PokemonWorld
        </Link>
        <div className="d-flex align-items-center gap-2">
          {/* Menú Dropdown de Acciones */}
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-info dropdown-toggle btn-sm"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Favoritos ({store.favorites ? store.favorites.length : 0})
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              style={{ minWidth: "200px" }}
            >
              {store.favorites && store.favorites.length > 0 ? (
                store.favorites.map((fav) => (
                  <li key={fav.id}>
                    <Link
                      to={`/pokemon/${fav.id}`}
                      className="dropdown-item d-flex align-items-center justify-content-between"
                    >
                      <span>{fav.pokemon_name}</span>
                      <i className="bi bi-heart-fill text-danger small"></i>
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <span className="dropdown-item text-muted small">
                    No hay favoritos
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* RENDERIZADO CONDICIONAL: Evaluamos si existe un token en la tienda global */}
          {!store.token ? (
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-light btn-sm"
                onClick={abrirLoginModal}
              >
                Iniciar Sesión
              </button>
            </div>
          ) : (
            // El usuario SÍ está autenticado -> Mostramos bienvenida y botón de Cerrar Sesión
            <div className="d-flex align-items-center gap-3">
              {store.user && (
                <span className="text-light me-2 small">
                  ¡Hola,{" "}
                  {store.user.pokemon_name || store.user.name || "Usuario"}!
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
