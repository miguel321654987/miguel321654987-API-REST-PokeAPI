const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * 🔧 HELPER DE CIERRE DEFENSIVO DE MODALES
 * En local (VS Code), Bootstrap a veces no está completamente inicializado en el instante exacto
 * del setTimeout. Este helper intenta cerrar el modal de 3 formas progresivas para garantizar
 * que se cierre correctamente sin dejar abierto el backdrop ni el overlay.
 */
const closeModalSafely = (modalId) => {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  // Intento 1: Usar la API oficial de Bootstrap si está disponible
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

  // Intento 2 (Fallback para local): Ocultar manualmente con CSS y limpiar el backdrop
  modalEl.classList.remove("show");
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.style.display = "none";

  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) backdrop.remove();

  document.body.classList.remove("modal-open");
};

/**
 * 🔧 HELPER DE APERTURA DEFENSIVA DE MODALES
 * Complemento para closeModalSafely. Abre un modal de forma defensiva en local (VS Code).
 * Intenta primero con Bootstrap, y si no está disponible, lo abre manualmente con CSS.
 * Necesario en local porque el timing de Bootstrap puede no coincidir exactamente.
 */
const openModalSafely = (modalId) => {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  // Intento 1: Usar la API oficial de Bootstrap si está disponible
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

  // Intento 2 (Fallback para local): Abrir manualmente con CSS
  modalEl.classList.add("show");
  modalEl.setAttribute("aria-hidden", "false");
  modalEl.style.display = "block";

  // Crear y agregar backdrop manualmente
  if (!document.querySelector(".modal-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);
  }

  document.body.classList.add("modal-open");
};

/**
 * 🔧 HELPER PARA CAMBIAR ENTRE MODALES
 * Cierra un modal y abre otro de forma defensiva. Útil para transiciones entre
 * Login y Signup sin dejar backdrops o overlays atrapados.
 * Necesario en local VS Code porque Bootstrap a veces no está completamente
 * inicializado en el instante exacto del evento click.
 */
const switchModals = (closeId, openId) => {
  closeModalSafely(closeId);
  // Pequeño delay para asegurar que el primero se cerró antes de abrir el siguiente
  setTimeout(() => {
    openModalSafely(openId);
  }, 100);
};

export const getActions = (store, dispatch) => {
  return {
    // === 🔐 CONTROL DE SESIÓN (AUTENTICACIÓN) ===
    handleLogout: () => {
      // 1. Limpieza inmediata de datos locales y globales
      localStorage.removeItem("jwt-token");
      dispatch({ type: "LOGOUT" });

      // 2. El modal de login se abre con el patrón nativo de Bootstrap en el botón del Navbar.
      // No intentamos abrirlo manualmente aquí para evitar el warning en local.
      dispatch({
        type: "SET_MESSAGE",
        payload: {
          msg: "Sesión expirada. Por favor, identifícate de nuevo.",
          status: 401,
        },
      });

      // 3. Limpiar el mensaje tras unos segundos adicionales
      setTimeout(() => {
        dispatch({ type: "SET_MESSAGE", payload: null });
      }, 3000);
    },

    // === 👾 PETICIONES DE POKÉMON (API EXTERNA) ===
    obtenerPokemons: async () => {
      if (store.api.list && store.api.list.length > 0) return;

      try {
        dispatch({ type: "API_LOADING" });
        const response = await fetch("https://tcgdex.net");
        const data = await response.json();

        if (data && Array.isArray(data)) {
          const datosFormateados = data.map((carta) => ({
            id: String(carta.id),
            pokemon_name: carta.name,
            image:
              carta.image && carta.image.includes("http")
                ? `${carta.image}/low.png`
                : "",
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

    // === ❤️ GESTIÓN DE FAVORITOS (TU BACKEND FLASK) ===
    cargarFavoritosBackend: async (userId) => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites`,
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
            headers: { "Content-Type": "application/json" },
          },
        );
        if (response.status === 409) return; // Validación de conflicto ya capturada por Flask
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

// Exportar helpers para ser usados desde componentes (Login, Signup)
export { closeModalSafely, openModalSafely, switchModals };
