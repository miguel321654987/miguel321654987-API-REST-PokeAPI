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
              {/* 🌟 Eliminamos onClick y usamos atributos nativos de Bootstrap */}
              <button
                className="btn btn-outline-light btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#loginModal"
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
