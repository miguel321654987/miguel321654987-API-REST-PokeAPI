import { useContext, useMemo, createContext } from "react";
import { getActions } from "./actions.js";

// Creamos y exportamos el contexto de manera limpia en el archivo del hook
export const StoreContext = createContext(null);

export default function useGlobalReducer() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useGlobalReducer must be used within StoreProvider");
  }

  const { store, dispatch } = context;

  // Memorizamos las acciones pasando el store y el dispatch actuales
  const actions = useMemo(() => {
    return getActions(store, dispatch);
  }, [store, dispatch]);

  return { store, dispatch, actions };
}
