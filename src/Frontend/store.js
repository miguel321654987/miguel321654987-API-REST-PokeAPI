export const initialStore = () => {
  return {
    message: null,
    token: localStorage.getItem("jwt-token") || null,
    user: null,
    api: {
      loading: false,
      list: [],
      detail: null,
      error: null,
    },
    favorites: [],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...store,
        token: action.payload,
      };

    case "LOGOUT":
      return {
        ...store,
        token: null,
        user: null,
        message: { msg: "👋 ¡Sesión cerrada con éxito!", status: 200 },
      };

    case "SET_MESSAGE":
      return {
        ...store,
        message: action.payload,
      };

    case "API_LOADING":
      return {
        ...store,
        api: {
          ...store.api,
          loading: true,
          error: null,
        },
      };

    case "API_LIST_SUCCESS":
      return {
        ...store,
        api: {
          ...store.api,
          loading: false,
          list: action.payload, // Guarda solo la lista
          error: null,
        },
      };

    case "API_DETAIL_SUCCESS":
      return {
        ...store,
        api: {
          ...store.api,
          loading: false,
          detail: action.payload, // Guarda solo el detalle individual
          error: null,
        },
      };

    case "API_ERROR":
      return {
        ...store,
        api: {
          ...store.api,
          loading: false,
          error: action.payload,
        },
      };

    case "SET_FAVORITES":
      return {
        ...store,
        favorites: action.payload, // Guarda directamente el array traído de Flask
      };

    case "ADD_FAVORITE_STORE":
      return {
        ...store,
        favorites: [...store.favorites, action.payload],
      };

    case "REMOVE_FAVORITE_STORE":
      return {
        ...store,
        favorites: store.favorites.filter((fav) => fav.id !== action.payload),
      };

    default:
      throw Error("Unknown action.");
  }
}
