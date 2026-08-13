import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link } from "react-router-dom";
import imagenRespaldo from "../../assets/no-card-image.png";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();

  //Extraemos de forma limpia las variables directamente desde tu store global
  const { list: pokemons, loading, error } = store.api;

  useEffect(() => {
    const obtenerPokemons = async () => {
      if (pokemons && pokemons.length > 0) {
        return; // Corta la ejecución aquí; no hace falta pedir nada a internet
      }
      try {
        dispatch({ type: "API_LOADING" }); //Usamos acción del reducer para activar el estado de carga global

        const response = await fetch(
          "https://api.tcgdex.net/v2/en/cards?pagination:page=1&pagination:itemsPerPage=20",
        );
        const data = await response.json();

        // 💡 CORRECCIÓN CRÍTICA: La API devuelve directamente un Array, no un objeto con propiedad .v2
        if (data && Array.isArray(data)) {
          // Mapeamos el array directamente
          const datosFormateados = data.map((carta) => {
            const tieneImagen = carta.image && carta.image.includes("http");

            return {
              id: String(carta.id), // 💡 ARREGLO DE TIPADO: Siempre será un string en tu store
              pokemon_name: carta.name,
              image: tieneImagen ? `${carta.image}/low.png` : imagenRespaldo, // Marcador de posición limpio si no hay imagen
            };
          });

          // Guardamos los datos limpios en tu store global y desactivamos el loading
          dispatch({ type: "API_LIST_SUCCESS", payload: datosFormateados });
        } else {
          throw new Error( // Si por alguna razón la respuesta no es un array, lanzamos error estructurado
            "La respuesta del servidor no tiene el formato esperado.",
          );
        }
      } catch (err) {
        console.error("Error crítico al conectar con la API de TCGdex:", err);
        // 5. Desactivamos el loading enviando el mensaje de error al store
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    };

    obtenerPokemons();
  }, [dispatch, pokemons]); // Se añade pokemons para evaluar correctamente la condición de salida inicial

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
                      style={{ minHeight: "220px" }}
                    >
                      <img
                        src={pokemon.image}
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
                      <Link
                        to={`/pokemon/${pokemon.id}`}
                        className="btn btn-outline-warning btn-sm w-100"
                      >
                        Ver Detalles
                      </Link>
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
