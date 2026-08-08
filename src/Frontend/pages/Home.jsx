import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();

  // 1. Extraemos de forma limpia las variables directamente desde tu store global
  const { data: pokemons, loading, error } = store.api;

  useEffect(() => {
    // 2. Comprobamos si ya existen datos en el store para evitar el fetch por completo
    if (pokemons && pokemons.length > 0) {
      return; // Corta la ejecución aquí; no hace falta pedir nada a internet
    }

    const obtenerPokemons = async () => {
      try {
        // 3. Usamos tu acción del reducer para activar el estado de carga global
        dispatch({ type: "API_LOADING" });

        const response = await fetch(
          "https://api.tcgdex.net/v2/en/cards?limit=10&offset=0",
        );
        const data = await response.json();

        if (data && data.results) {
          // 4. Guardamos los datos en el store (tu reducer apagará el loading automáticamente)
          dispatch({ type: "API_SUCCESS", payload: data.results });
        }
      } catch (err) {
        console.error("Error crítico al conectar con la PokeAPI externa:", err);
        // 5. Usamos tu acción de error si la petición falla
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    };

    obtenerPokemons();
  }, [dispatch, pokemons]); // Dependencias limpias basadas en el valor del store

  return (
    <div className="container text-center mt-5 text-light">
      <h1 className="mb-4">¡Bienvenido a la PokeApp!</h1>

      {loading ? (
        <div className="mt-4">
          <p className="text-warning">Conectando con el servidor...</p>
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      ) : (
        <div className="row g-4 justify-content-center mt-2">
          {pokemons.length === 0 ? (
            <p className="text-danger">
              No se recibieron datos desde el servidor Flask.
            </p>
          ) : (
            pokemons.map((pokemon) => {
              // 💡 Usamos el ID real que viene de tu base de datos SQLite
              const pokemonId = pokemon.id;

              // 💡 Corregimos la URL oficial de las imágenes de alta definición
              const imageUrl = `https://githubusercontent.com{pokemonId}.png`;

              return (
                <div key={pokemon.id} className="col-6 col-md-4 col-lg-3">
                  <div className="card bg-dark text-light border-secondary h-100 shadow-sm">
                    <div
                      className="p-3 bg-secondary bg-opacity-20 d-flex justify-content-center align-items-center"
                      style={{ minHeight: "150px" }}
                    >
                      <img
                        src={imageUrl}
                        alt={pokemon.pokemon_name} // 👈 Corregido: pokemon_name
                        className="img-fluid"
                        style={{ maxHeight: "120px", objectFit: "contain" }}
                      />
                    </div>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title text-capitalize fs-5 mb-3">
                        <span className="text-secondary fs-6 me-1">
                          #{pokemonId}
                        </span>
                        {/* 💡 Corregido: usamos pokemon_name para que coincida con tu .serialize() */}
                        {pokemon.pokemon_name}
                      </h5>
                      <button className="btn btn-outline-warning btn-sm w-100">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
