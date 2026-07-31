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
    const fetchData = async () => {
      // CORRECCIÓN FLUJO: Los datos externos de CoinGecko deben cargarse SIEMPRE,
      // estemos logueados o no. Los datos privados de usuario solo si hay token.

      // --- 1. Obtener Datos Externos (CoinGecko - Público) ---
      const options = {
        method: "GET",
        headers: { "x-cg-demo-api-key": import.meta.env.VITE_API_KEY },
      };

      try {
        dispatch({ type: "API_LOADING", payload: "Loading External Data..." });
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
          options,
        );
        if (!response.ok)
          throw new Error("Error en la API externa de CoinGecko");

        const result = await response.json();
        dispatch({ type: "API_SUCCESS", payload: result });
      } catch (err) {
        console.error("Error en la carga externa:", err);
        dispatch({
          type: "API_ERROR",
          payload: `CoinGecko error: ${err.message}`,
        });
      }

      // --- FILTRO DE SEGURIDAD INTERNO ---
      // Si no hay token, nos detenemos aquí de forma segura. CoinGecko ya se cargó.
      if (!store.token) return;

      // --- 2. Obtener Perfil de Usuario (Verificación de Token/Sesión) ---
      try {
        const userresponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.token}`, // Usamos store.token directamente
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

      // --- 3. Obtener Favoritos de Pokémon (Privado) ---
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
          payload: favoriteData.results || favoriteData, // Previene fallos si tu API encapsula en .results
        });
      } catch (error) {
        console.error("Error al obtener favoritos:", error);
        dispatch({ type: "FAVORITES_ERROR", payload: error.message });
      }
    };

    fetchData();
    // CORRECCIÓN CRUCIAL: Añadimos store.token para que se reactive al iniciar/cerrar sesión
  }, [dispatch, store.token]);

  // OPTIMIZACIÓN: Evita que un error en CoinGecko rompa toda la visualización de la App
  if (store.api.loading && !store.api.data)
    return <p>Cargando datos del mercado...</p>;

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
