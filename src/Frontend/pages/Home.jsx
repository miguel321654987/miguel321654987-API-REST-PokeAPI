import { useState, useEffect } from "react";

export const Home = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);

 import { useState, useEffect } from "react";
import useGlobalReducer from "./useGlobalReducer"; // Importamos tu hook global

export const Home = () => {
  const { store, dispatch } = useGlobalReducer(); // 👈 Modificado: Extraemos 'store' además de 'dispatch'
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 👈 Añadido: Si el store ya tiene los datos, los usamos y evitamos el fetch por completo
    if (store.api.data && store.api.data.length > 0) {
      setPokemons(store.api.data);
      setLoading(false);
      return; // Corta la ejecución aquí para no hacer las líneas de abajo
    }

    const obtenerPokemons = async () => {
      try {
        // 1. fetch devuelve el objeto Response de la PokeAPI oficial
        // Agregamos ?limit=20 para traer los primeros 20 pokemons (puedes cambiar el número)
        const response = await fetch(
          "https://pokeapi.co",
        );

        // 2. .json() lo convierte a un objeto nativo de JavaScript
        const data = await response.json();

        // 3. La PokeAPI siempre estructura su respuesta como un objeto con la propiedad .results
        if (data && data.results) {
          setPokemons(data.results);
          
          // Guardamos los datos en tu storeReducer genérico
          dispatch({ type: "API_SUCCESS", payload: data.results }); 
        }
      } catch (error) {
        console.error(
          "Error crítico al conectar con la PokeAPI externa:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    obtenerPokemons();
  }, [dispatch, store.api.data]); // 👈 Añadido store.api.data como dependencia


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
