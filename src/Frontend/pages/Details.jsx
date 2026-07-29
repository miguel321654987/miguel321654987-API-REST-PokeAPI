import React from "react";
import { useParams } from "react-router-dom";

export const Details = () => {
  const { id } = useParams(); // Esto capturará el ID o nombre del Pokémon desde la URL

  return (
    <div className="container text-center mt-5">
      <h1>Detalles del Pokémon</h1>
      <p>
        Viendo la información del Pokémon con ID/Nombre: <strong>{id}</strong>
      </p>
    </div>
  );
};
