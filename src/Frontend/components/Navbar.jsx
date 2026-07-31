import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { toast } from "react-toastify";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();

  return (
    <div>
      <nav className="navbar navbar-light bg-light mb-3 px-3">
        <Link to="/" className="text-decoration-none">
          <span className="navbar-brand mb-0 h1">PokeAPI App</span>
        </Link>

        {/* Mantenemos tu contenedor ml-auto original combinando todos tus botones */}
        <div className="ml-auto d-flex align-items-center gap-3">
          {/* Tu enlace original de prueba para Pikachu */}
          <Link to="/pokemon/25">
            <button className="btn btn-primary">Ver Pikachu (Prueba)</button>
          </Link>

          {/* Botón para abrir el Modal de Login */}
          <button
            className="btn btn-dark"
            data-bs-toggle="modal"
            data-bs-target="#loginModal"
            onClick={() => dispatch({ type: "SET_MESSAGE", payload: null })}
          >
            Login
          </button>

          {/* Botón para abrir el Modal de Registro */}
          <button
            className="btn btn-warning text-dark"
            data-bs-toggle="modal"
            data-bs-target="#signupModal"
            onClick={() => dispatch({ type: "SET_MESSAGE", payload: null })}
          >
            Registrarse
          </button>
        </div>
      </nav>

      {/* Los componentes autoconstruidos se renderizan directamente aquí abajo */}
      <Login id="loginModal" />
      <Signup id="signupModal" />
    </div>
  );
};
