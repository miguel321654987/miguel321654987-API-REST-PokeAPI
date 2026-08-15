import { useReducer, useEffect } from "react";
import storeReducer, { initialStore } from "../store";
import { getActions } from "./actions.js";
import { StoreContext } from "../hooks/useGlobalReducer.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());

  useEffect(() => {
    // 🚀 EXTRACCIÓN LIMPIA: Sacamos el token de forma aislada
    const { token } = store;

    const verificarSesionYCargarDatos = async () => {
      // Evaluamos la variable local aislada
      if (!token) return;

      const actions = getActions(store, dispatch);

      try {
        const userResponse = await fetch(`${BACKEND_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Usamos la variable aislada
          },
        });

        if (userResponse.status === 401) {
          actions.handleLogout();
          return;
        }

        const userData = await userResponse.json();
        dispatch({ type: "LOGIN_SUCCESS", payload: userData });

        if (userData && userData.id) {
          await actions.cargarFavoritosBackend(userData.id);
        }
      } catch (error) {
        console.error("Error al sincronizar sesión con el servidor:", error);
      }
    };

    verificarSesionYCargarDatos();

    // ✅ SOLUCIÓN: Al pasar 'store', React sabe exactamente cuándo rastrear cambios sin romper el flujo
  }, [store]);

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}
