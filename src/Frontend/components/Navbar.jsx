import { Link, useNavigate } from "react-router-dom"; // Importamos useNavigate para redirigir si quieres
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { toast } from "react-toastify";

export const Navbar = () => {
  // Extraemos el 'store' para leer si hay un token o usuario guardado
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  // Función interna para procesar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("jwt-token"); // Borra el token del almacenamiento local
    dispatch({ type: "LOGOUT" }); // Limpia el estado global (recuerda añadirlo a tu store.js)
    toast.info("Sesión cerrada correctamente");
    navigate("/"); // Redirige al inicio por seguridad
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light mb-3 px-3">
        <Link to="/" className="text-decoration-none">
          <span className="navbar-brand mb-0 h1">PokeAPI App</span>
        </Link>

        <div className="ml-auto d-flex align-items-center gap-3">
          {/* Tu enlace original de prueba para Pikachu */}
          <Link to="/pokemon/25">
            <button className="btn btn-primary">Ver Pikachu (Prueba)</button>
          </Link>

          {/* 🔄 RENDERIZADO CONDICIONAL: Evaluamos si existe un token en el estado global */}
          {!store.token ? (
            <>
              {/* Si NO hay token: Mostramos Login y Registro */}
              <button
                className="btn btn-dark"
                data-bs-toggle="modal"
                data-bs-target="#loginModal"
                onClick={() => dispatch({ type: "SET_MESSAGE", payload: null })}
              >
                Login
              </button>

              <button
                className="btn btn-warning text-dark"
                data-bs-toggle="modal"
                data-bs-target="#signupModal"
                onClick={() => dispatch({ type: "SET_MESSAGE", payload: null })}
              >
                Registrarse
              </button>
            </>
          ) : (
            <>
              {/* Si SÍ hay token: Mostramos el botón de Cerrar Sesión */}
              <button className="btn btn-danger" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </nav>

      <Login id="loginModal" />
      <Signup id="signupModal" />
    </div>
  );
};
