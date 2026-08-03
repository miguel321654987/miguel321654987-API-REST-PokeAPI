import React from "react";

export const Home = () => {
  return (
    // 🚀 Añadimos text-light para que todo el texto dentro del contenedor sea blanco/claro
    <div className="container text-center mt-5 text-light">
      <h1>¡Bienvenido a la PokeApp!</h1>
      <p className="text-secondary">
        Aquí se mostrará la lista de Pokémon próximamente.
      </p>
    </div>
  );
};
