import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();

  // 1. Extraemos de forma limpia las variables directamente desde tu store global
  const { data: pokemons, loading, error } = store.api;

  useEffect(() => {
    const obtenerPokemons = async () => {
      // 2. Comprobamos si ya existen datos en el store para evitar el fetch por completo
      if (pokemons && pokemons.length > 0) {
        return; // Corta la ejecución aquí; no hace falta pedir nada a internet
      }
      try {
        // 3. Usamos tu acción del reducer para activar el estado de carga global
        dispatch({ type: "API_LOADING" });

        // Modificamos la URL para pedirle explícitamente al servidor la página 1 con solo 20 cartas
        const response = await fetch(
          "https://api.tcgdex.net/v2/en/cards?pagination:page=1&pagination:itemsPerPage=20",
        );
        const data = await response.json();

        // 💡 CAMBIO CRÍTICO: La API de TCGdex guarda las cartas paginadas en la propiedad 'v2'
        if (data && Array.isArray(data.v2)) {
          // Mapeamos el array 'data.v2' que ya contiene exactamente 20 elementos
          const datosFormateados = data.v2.map((carta) => ({
            id: carta.id,
            pokemon_name: carta.name, // Mantenemos consistencia con tu propiedad 'pokemon_name'
            // Extraemos la URL oficial directa del JSON y le añadimos la extensión de calidad ligera
            image: carta.image
              ? `${carta.image}/low.png`
              : "https://placeholder.com", // Agregado placeholder válido para que no rompa la UI
          }));

          // Guardamos los datos limpios en tu store global
          dispatch({ type: "API_SUCCESS", payload: datosFormateados });
        }
      } catch (err) {
        console.error("Error crítico al conectar con la API de TCGdex:", err);
        // 5. Usamos tu acción de error si la petición falla
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    };

    obtenerPokemons();
  }, [dispatch]); // Dependencias limpias basadas en el valor del store

  return (
    <div className="container text-center mt-5 text-light">
      <h1 className="mb-4">¡Bienvenido a la PokeApp TCG!</h1>

      {loading ? (
        <div className="mt-4">
          <p className="text-warning">Conectando con el servidor...</p>
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      ) : error ? (
        <p className="text-danger mt-4">
          Hubo un error al cargar las cartas: {error}
        </p>
      ) : (
        <div className="row g-4 justify-content-center mt-2">
          {!pokemons || pokemons.length === 0 ? (
            <p className="text-danger">
              No se recibieron datos desde el servidor de TCGdex.
            </p>
          ) : (
            pokemons.map((pokemon) => {
              return (
                <div key={pokemon.id} className="col-6 col-md-4 col-lg-3">
                  <div className="card bg-dark text-light border-secondary h-100 shadow-sm">
                    <div
                      className="p-3 bg-secondary bg-opacity-20 d-flex justify-content-center align-items-center"
                      style={{ minHeight: "220px" }} // Subido un poco el alto ya que las cartas TCG son verticales
                    >
                      <img
                        src={pokemon.image} // 💡 Usamos la URL de la imagen nativa del store
                        alt={pokemon.pokemon_name}
                        className="img-fluid"
                        style={{ maxHeight: "180px", objectFit: "contain" }}
                      />
                    </div>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title text-capitalize fs-6 mb-3 text-start">
                        <span className="text-secondary fs-6 small block d-block mb-1">
                          ID: {pokemon.id}
                        </span>
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
