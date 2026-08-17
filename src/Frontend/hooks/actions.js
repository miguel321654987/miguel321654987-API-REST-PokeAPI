import defaultImage from "../../assets/no-card-image.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * 🔧 HELPER DE CIERRE DEFENSIVO DE MODALES
 */
const closeModalSafely = (modalId) => {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  if (window.bootstrap?.Modal) {
    try {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.hide();
      return;
    } catch (error) {
      console.warn(
        `Bootstrap Modal.hide() falló para #${modalId}, usando fallback CSS`,
        error,
      );
    }
  }

  modalEl.classList.remove("show");
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.style.display = "none";

  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) backdrop.remove();

  document.body.classList.remove("modal-open");
  document.body.style.overflow = ""; // 🔥 Restablece el scroll si Bootstrap se quedó colgado
};

/**
 * 🔧 HELPER DE APERTURA DEFENSIVA DE MODALES
 */
const openModalSafely = (modalId) => {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  if (window.bootstrap?.Modal) {
    try {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.show();
      return;
    } catch (error) {
      console.warn(
        `Bootstrap Modal.show() falló para #${modalId}, usando fallback CSS`,
        error,
      );
    }
  }

  modalEl.classList.add("show");
  modalEl.setAttribute("aria-hidden", "false");
  modalEl.style.display = "block";

  if (!document.querySelector(".modal-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);
  }

  document.body.classList.add("modal-open");
};

/**
 * 🔧 HELPER PARA CAMBIAR ENTRE MODALES
 */
const switchModals = (closeId, openId) => {
  closeModalSafely(closeId);

  // 🔥 Escucha el evento nativo de Bootstrap para abrir el siguiente solo cuando el primero se oculte del todo
  const closeEl = document.getElementById(closeId);
  if (closeEl && window.bootstrap?.Modal) {
    closeEl.addEventListener(
      "hidden.bs.modal",
      () => {
        openModalSafely(openId);
      },
      { once: true },
    ); // { once: true } evita que el evento se quede escuchando siempre
  } else {
    // Fallback si Bootstrap no está listo
    setTimeout(() => {
      openModalSafely(openId);
    }, 150);
  }
};

export const getActions = (store, dispatch) => {
  // 🔥 Helper interno para incluir el Token JWT de forma automática y segura
  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwt-token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Envía Bearer token si existe
    };
  };

  return {
    // === 🔐 CONTROL DE SESIÓN ===
    handleLogout: () => {
      localStorage.removeItem("jwt-token");
      dispatch({ type: "LOGOUT" });

      dispatch({
        type: "SET_MESSAGE",
        payload: {
          msg: "Sesión expirada. Por favor, identifícate de nuevo.",
          status: 401,
        },
      });

      setTimeout(() => {
        dispatch({ type: "SET_MESSAGE", payload: null });
      }, 3000);
    },

    // === 👾 PETICIONES DE POKÉMON ===
    obtenerPokemons: async () => {
      if (store.api.list && store.api.list.length > 0) return;

      try {
        dispatch({ type: "API_LOADING" });
        const response = await fetch(
          "https://api.tcgdex.net/v2/en/cards?pagination:page=1&pagination:itemsPerPage=20",
        );

        if (!response.ok)
          throw new Error("Error al obtener los pokémons de la API externa");
        const data = await response.json();

        // 🔥 Corrección: TCGdex a veces devuelve un objeto con paginación, no un Array directo
        const listaCartas = Array.isArray(data) ? data : data.cards;

        if (listaCartas && Array.isArray(listaCartas)) {
          const datosFormateados = listaCartas.map((carta) => ({
            id: String(carta.id),
            pokemon_name: carta.name,
            image: carta.image ? `${carta.image}/low.png` : defaultImage, // Simplificado el fallback
          }));
          dispatch({ type: "API_LIST_SUCCESS", payload: datosFormateados });
        } else {
          throw new Error(
            "La respuesta del servidor no tiene el formato esperado.",
          );
        }
      } catch (err) {
        console.error("Error crítico al conectar con la API de TCGdex:", err);
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    },

    // === 👾 PETICIONES DE POKÉMON (Añade esto dentro de getActions) ===
    obtenerDetallePokemon: async (id) => {
      try {
        dispatch({ type: "API_LOADING" });

        // 💡 Detector definitivo para la expansión "exu" con caracteres especiales
        let idTexto = String(id).trim();
        if (
          idTexto.toLowerCase().startsWith("exu-") &&
          (idTexto.includes("?") ||
            idTexto.includes("%") ||
            idTexto.toLowerCase().includes("3f"))
        ) {
          idTexto = "exu-%253F"; // Doble codificación requerida por este servidor específico
        } else {
          idTexto = encodeURIComponent(idTexto);
        }

        const response = await fetch(
          `https://api.tcgdex.net/v2/en/cards/${idTexto}`,
        );

        if (!response.ok) {
          throw new Error("No se pudo encontrar la información de esta carta.");
        }

        const data = await response.json();

        // 🔥 FORMATEO DEFENSIVO: Validamos la imagen aquí usando 'defaultImage'
        // TCGdex suele estructurar la imagen de la carta como un string o dentro de un objeto dependiendo de la versión
        const imagenFinal = data.image
          ? data.image.includes("http")
            ? `${data.image}/high.png`
            : data.image
          : defaultImage;

        const detalleFormateado = {
          ...data,
          image: imagenFinal, // Nos aseguramos de que siempre contenga algo válido
        };

        dispatch({ type: "API_DETAIL_SUCCESS", payload: detalleFormateado });
      } catch (err) {
        console.error("Error al cargar detalle:", err);
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    },

    // 🔥 Helper para limpiar el detalle al desmontar el componente
    limpiarDetallePokemon: () => {
      dispatch({ type: "API_DETAIL_SUCCESS", payload: null });
    },

    // === ❤️ GESTIÓN DE FAVORITOS ===
    cargarFavoritosBackend: async (userId) => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites`,
          { headers: getAuthHeaders() }, // Añadida seguridad
        );
        if (!response.ok)
          throw new Error("Error al obtener los favoritos del servidor");
        const data = await response.json();

        dispatch({
          type: "SET_FAVORITES",
          payload: data.results || data,
        });
      } catch (error) {
        console.error("Error cargando favoritos del backend:", error);
      }
    },

    añadirFavoritoBackend: async (userId, pokemon) => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites/${pokemon.id}`,
          {
            method: "POST",
            headers: getAuthHeaders(), // Centralizado y seguro
          },
        );
        if (response.status === 409) return;
        if (!response.ok)
          throw new Error("No se pudo añadir el favorito en el servidor");

        dispatch({ type: "ADD_FAVORITE_STORE", payload: pokemon });
      } catch (error) {
        console.error("Error al guardar favorito:", error);
      }
    },

    eliminarFavoritoBackend: async (userId, pokemonId) => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites/${pokemonId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(), // Asegura que solo el dueño borre
          },
        );
        if (!response.ok)
          throw new Error("No se pudo eliminar el favorito del servidor");

        dispatch({ type: "REMOVE_FAVORITE_STORE", payload: pokemonId });
      } catch (error) {
        console.error("Error al eliminar favorito:", error);
      }
    },
  };
};

export { closeModalSafely, openModalSafely, switchModals };
