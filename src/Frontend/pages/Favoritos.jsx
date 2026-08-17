import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Favoritos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const { data: favorito, loading, error } = store.api;

  // Simulamos el ID del usuario logueado (Hardcodeado a 1 para hacer las pruebas iniciales)
  const user_id = 1;

  useEffect(() => {
    const obtenerFavoritos = async () => {
      try {
        dispatch({ type: "API_LOADING" });
        // Hacemos la petición a tu servidor Flask (ajusta la URL según tu entorno)
        const response = await fetch(
          `http://localhost:3000/api/favorites//user/${user_id}/favorites`,
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar tus Pokémon favoritos.");
        }

        const data = await response.json();

        // 💡 TRUCO: Reconstruimos la URL de la imagen usando el ID de texto oficial de TCGdex
        const favoritosFormateados = data.map((fav) => ({
          id: fav.id, // ej: "basep-1"
          pokemon_name: fav.pokemon_name, // ej: "Pikachu"
          image: `https://tcgdex.net${fav.id}/low.png`,
        }));

        dispatch({ type: "API_SUCCESS", payload: favoritosFormateados });
      } catch (err) {
        console.error("Error al obtener favoritos:", err);
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    };

    obtenerFavoritos();
  }, [dispatch]);

  return (
    <div className="container text-center mt-5 text-light mb-5">
      <h1 className="mb-4 text-warning">⭐ Mis Cartas Favoritas</h1>
      <p className="text-secondary">
        Esta es tu colección privada guardada en la base de datos.
      </p>

      {loading ? (
        <div className="mt-4">
          <p className="text-warning">Cargando tu colección privada...</p>
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      ) : error ? (
        <p className="text-danger mt-4">Hubo un error: {error}</p>
      ) : (
        <div className="row g-4 justify-content-center mt-2">
          {favorito.length === 0 ? (
            <div className="mt-5 p-5 bg-dark rounded border border-secondary">
              <p className="text-muted fs-5 mb-3">
                Aún no has guardado ninguna carta.
              </p>
              <Link to="/" className="btn btn-warning btn-sm">
                Ir a buscar cartas
              </Link>
            </div>
          ) : (
            favorito.map((pokemon) => {
              return (
                <div key={pokemon.id} className="col-6 col-md-4 col-lg-3">
                  <div className="card bg-dark text-light border-warning h-100 shadow-sm">
                    {/* Contenedor de la imagen */}
                    <div
                      className="p-3 bg-secondary bg-opacity-20 d-flex justify-content-center align-items-center"
                      style={{ minHeight: "220px" }}
                    >
                      <img
                        src={pokemon.image}
                        alt={pokemon.pokemon_name}
                        className="img-fluid"
                        style={{ maxHeight: "180px", objectFit: "contain" }}
                        // Si por algún motivo la carta ya no existe en el CDN, muestra un placeholder
                        onError={(e) => {
                          e.target.src = "https://placehold.co";
                        }}
                      />
                    </div>

                    {/* Cuerpo de la tarjeta */}
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title text-capitalize fs-6 mb-3 text-start">
                        <span className="text-warning fs-6 small block d-block mb-1">
                          ID: {pokemon.id}
                        </span>
                        {pokemon.pokemon_name}
                      </h5>

                      {/* Botón dinámico que redirige usando el ID de texto */}
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
