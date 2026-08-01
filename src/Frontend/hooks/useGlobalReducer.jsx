// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext, useEffect } from "react";
import storeReducer, { initialStore } from "../store";
import { toast } from "react-toastify";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());

  const handleLogout = () => {
    // 1. Limpieza de datos
    localStorage.removeItem("jwt-token");
    dispatch({ type: "LOGOUT" });

    // 2. Abrir el modal de Login
    setTimeout(() => {
      const loginButton = document.querySelector(
        '[data-bs-target="#loginModal"]',
      );
      if (loginButton) loginButton.click();

      dispatch({
        type: "SET_MESSAGE",
        payload: {
          msg: "Sesión expirada. Por favor, identifícate de nuevo.",
          status: 401,
        },
      });
    }, 1000);

    // 3. Limpiar el mensaje tras unos segundos
    setTimeout(() => {
      dispatch({ type: "SET_MESSAGE", payload: null });
    }, 1000);
  };

  useEffect(() => {
    // 🛑 FETCH COMENTADO TEMPORALMENTE PARA PROBAR SIGNUP Y LOGIN
    /*
    const fetchData = async () => {
      try {
        dispatch({ type: "API_LOADING", payload: "Loading Pokémon Data..." });
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=151",
        );
        if (!response.ok) throw new Error("Error al consultar la PokeAPI");
        const result = await response.json();
        dispatch({ type: "API_SUCCESS", payload: result.results });
      } catch (err) {
        console.error("Error en la carga de Pokémon:", err);
        dispatch({
          type: "API_ERROR",
          payload: `PokeAPI error: ${err.message}`,
        });
      }

      if (!store.token) return;

      try {
        const userresponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.token}`,
            },
          },
        );
        if (userresponse.status === 401) {
          handleLogout();
          toast.info("Token inválido o expirado. Cerrando sesión.");
          return;
        }
      } catch (error) {
        console.error("Error al obtener perfil del usuario:", error);
      }

      try {
        const favResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/favorites`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.token}`,
            },
          },
        );
        if (!favResponse.ok)
          throw new Error(
            `Falló al cargar favoritos: ${favResponse.statusText}`,
          );
        const favoriteData = await favResponse.json();
        dispatch({
          type: "FAVORITES_SUCCESS",
          payload: favoriteData.results || favoriteData,
        });
      } catch (error) {
        console.error("Error al obtener favoritos:", error);
        dispatch({ type: "FAVORITES_ERROR", payload: error.message });
      }
    };

    fetchData();
    */
  }, [dispatch, store.token]);

  // Se eliminó el bloqueo de "Cargando..." para que renderice directo tus formularios
  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export default function useGlobalReducer() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useGlobalReducer must be used within StoreProvider");
  }
  return context;
}
