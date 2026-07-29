import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-light bg-light mb-3 px-3">
      <Link to="/">
        <span className="navbar-brand mb-0 h1">PokeAPI App</span>
      </Link>
      <div className="ml-auto">
        {/* Enlace de prueba para simular que entramos a ver a Pikachu (ID 25) */}
        <Link to="/pokemon/25">
          <button className="btn btn-primary">Ver Pikachu (Prueba)</button>
        </Link>
      </div>
    </nav>
  );
};
