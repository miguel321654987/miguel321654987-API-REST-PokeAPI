import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { openModalSafely } from "../utils.js"; // 🔥 CORRECCIÓN 1: Importamos el helper seguro
import { toast } from "react-toastify";

export const Navbar = () => {
  const { store, actions } = useGlobalReducer();
  const navigate = useNavigate();

  const clickLogout = () => {
    actions.handleLogout();
    toast.info("Sesión cerrada correctamente");
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

          {/* RENDERIZADO CONDICIONAL */}
          {!store.token ? (
            <div className="d-flex align-items-center gap-2">
              {/* 🔥 CORRECCIÓN 2: Eliminamos los atributos nativos data-bs-* que causaban */}
              {/* el error de la consola y usamos el control seguro por JS de openModalSafely */}
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() => openModalSafely("loginModal")}
              >
                Iniciar Sesión
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-3">
              {store.user && (
                <span className="text-light me-2 small">
                  ¡Hola,{" "}
                  {store.user?.email
                    ? store.user.email.split("@")[0]
                    : "Usuario"}
                  !
                </span>
              )}
              {/* 🔥 CORRECCIÓN 3: Especificamos el tipo del botón para evitar comportamientos extraños */}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={clickLogout}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
