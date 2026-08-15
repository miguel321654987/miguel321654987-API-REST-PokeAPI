const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const getActions = (store, dispatch) => {
  return {
    // === 🔐 CONTROL DE SESIÓN (AUTENTICACIÓN) ===
    handleLogout: () => {
      // 1. Limpieza inmediata de datos locales y globales
      localStorage.removeItem("jwt-token");
      dispatch({ type: "LOGOUT" });

      // 2. Abrir el modal de Login de forma segura mediante la API de Bootstrap
      setTimeout(() => {
        const modalElement = document.getElementById("loginModal");

        if (modalElement) {
          if (window.bootstrap && window.bootstrap.Modal) {
            const modalInstance =
              window.bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show(); // Abre el modal inicializando el 'backdrop' correctamente
          } else {
            console.error(
              "Bootstrap JS no está disponible globalmente en la ventana (window.bootstrap).",
            );
          }
        }

        dispatch({
          type: "SET_MESSAGE",
          payload: {
            msg: "Sesión expirada. Por favor, identifícate de nuevo.",
            status: 401,
          },
        });
      }, 500); // Tiempo óptimo para que se limpie la interfaz antes de lanzar el modal

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
        const response = await fetch(`${BACKEND_URL}/user/${userId}/favorites`);
        if (!response.ok)
          throw new Error("Error al obtener los favoritos del servidor");
        const data = await response.json();

        // Sincroniza el array de favoritos mandando los datos directo al reducer
        dispatch({ type: "SET_FAVORITES", payload: data.results });
      } catch (error) {
        console.error("Error cargando favoritos del backend:", error);
      }
    },

    añadirFavoritoBackend: async (userId, pokemon) => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/user/${userId}/favorites/${pokemon.id}`,
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
          `${BACKEND_URL}/user/${userId}/favorites/${pokemonId}`,
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
