import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const { data: card, loading, error } = store.api;

  useEffect(() => {
    const obtenerDetallePokemon = async () => {
      try {
        dispatch({ type: "API_LOADING" });
        const response = await fetch(
          `https://api.tcgdex.net/v2/en/cards/${id}`,
        );

        if (!response.ok) {
          throw new Error("No se pudo encontrar la información de esta carta.");
        }

        const data = await response.json();
        dispatch({ type: "API_SUCCESS", payload: data });
      } catch (err) {
        console.error("Error al cargar detalle:", err);
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    };

    if (id) obtenerDetallePokemon();
  }, [id, dispatch]);

  return (
    <div className="container mt-5 text-light mb-5">
      {/* Botón para volver atrás de manera segura */}
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ← Volver a la Colección
      </button>

      {loading ? (
        <div className="text-center mt-5">
          <p className="text-warning">
            Cargando datos oficiales de la carta...
          </p>
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger mt-4 text-center" role="alert">
          {error}
        </div>
      ) : card ? (
        <div className="row g-5 justify-content-center align-items-start">
          {/* Columna Izquierda: Imagen de la carta */}
          <div className="col-12 col-md-5 text-center">
            <div className="p-3 bg-secondary bg-opacity-10 rounded shadow-lg">
              <img
                src={
                  card.image ? `${card.image}/high.png` : "https://placehold.co"
                }
                alt={card.name}
                className="img-fluid rounded-3 shadow"
                style={{ maxHeight: "500px", objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Columna Derecha: Atributos y Estadísticas */}
          <div className="col-12 col-md-7">
            <div className="p-4 bg-dark border border-secondary rounded-3 shadow-sm">
              <span className="badge bg-warning text-dark mb-2 fs-6">
                ID: {card.id}
              </span>
              <h1 className="display-5 fw-bold mb-3 text-warning">
                {card.name}
              </h1>

              <div className="row g-3 mb-4">
                <div className="col-6 col-sm-4">
                  <strong className="text-secondary d-block">Expansión:</strong>
                  <span>{card.set?.name || "Desconocida"}</span>
                </div>
                <div className="col-6 col-sm-4">
                  <strong className="text-secondary d-block">Rareza:</strong>
                  <span>{card.rarity || "Común"}</span>
                </div>
                <div className="col-6 col-sm-4">
                  <strong className="text-secondary d-block">
                    Puntos de Vida (HP):
                  </strong>
                  <span className="text-danger fw-bold">
                    {card.hp || "N/A"}
                  </span>
                </div>
              </div>

              {/* Tipos Elementales */}
              {card.types && card.types.length > 0 && (
                <div className="mb-4">
                  <strong className="text-secondary d-block mb-2">
                    Tipos:
                  </strong>
                  {card.types.map((type, index) => (
                    <span
                      key={index}
                      className="badge bg-danger me-2 px-3 py-2 fs-6 text-capitalize"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}

              {/* Listado de Ataques */}
              <h3 className="h4 border-bottom border-secondary pb-2 mb-3 text-warning text-opacity-75">
                Ataques Disponibles
              </h3>

              {!card.attacks || card.attacks.length === 0 ? (
                <p className="text-muted italic">
                  Esta carta no posee ataques listados.
                </p>
              ) : (
                <div className="list-group list-group-flush bg-transparent">
                  {card.attacks.map((attack, index) => (
                    <div
                      key={index}
                      className="list-group-item bg-transparent text-light border-secondary px-0 py-3"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="fs-5 text-info">
                          {attack.name}
                        </strong>
                        {attack.damage && (
                          <span className="badge bg-outline-danger border border-danger text-danger px-2">
                            Daño: {attack.damage}
                          </span>
                        )}
                      </div>
                      <p className="text-secondary small mb-0">
                        {attack.effect || "Sin efectos secundarios."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
