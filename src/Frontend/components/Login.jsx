import { useState } from "react"; // 💡 Ya no necesitas 'useRef'
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { toast } from "react-toastify";

export const Login = ({ id }) => {
  const { dispatch } = useGlobalReducer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch({ type: "SET_MESSAGE", payload: null });

    if (!email.trim() || !password.trim()) {
      dispatch({
        type: "SET_MESSAGE",
        payload: { msg: "⚠️ Los campos están vacíos", status: 400 },
      });
      return;
    }
    if (password.length < 6) {
      dispatch({
        type: "SET_MESSAGE",
        payload: {
          msg: "⚠️ La contraseña debe tener al menos 6 caracteres",
          status: 400,
        },
      });
      return;
    }

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!resp.ok) {
        const datosError = await resp.json();
        const mensajeDelBack = datosError.message || "Error al iniciar sesión";
        dispatch({
          type: "SET_MESSAGE",
          payload: { msg: `⚠️ ${mensajeDelBack}`, status: resp.status },
        });
        toast.error(mensajeDelBack);
        return;
      }

      const data = await resp.json();
      localStorage.setItem("jwt-token", data.token);
      dispatch({ type: "LOGIN", payload: data.token });
      dispatch({
        type: "SET_MESSAGE",
        payload: { msg: "¡Sesión iniciada!", status: 200 },
      });
      toast.success("¡Sesión iniciada!");

      // 🌟 SOLUCIÓN AQUÍ: Cierre seguro usando la API oficial de Bootstrap
      setTimeout(() => {
        const modalElement = document.getElementById(id); // Buscamos el contenedor del modal por su id

        if (modalElement && window.bootstrap && window.bootstrap.Modal) {
          // Obtenemos la instancia que Bootstrap ya creó o creamos una limpia
          const modalInstance =
            window.bootstrap.Modal.getOrCreateInstance(modalElement);
          modalInstance.hide(); // 🚀 Cierra el modal y elimina el fondo (backdrop) de forma segura
        }

        dispatch({ type: "SET_MESSAGE", payload: null });
        setEmail("");
        setPassword("");
      }, 1000);
    } catch {
      dispatch({
        type: "SET_MESSAGE",
        payload: { msg: "Error de conexión", status: 500 },
      });
      toast.error("Error de conexión");
    }
  };

  return (
    <div
      className="modal fade"
      id={id}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content" onSubmit={handleLogin}>
          <div className="modal-header">
            <h2 className="modal-title fs-5">Login</h2>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal" // Conservamos esto para cuando el usuario hace clic manual
              aria-label="Close"
              onClick={() => {
                dispatch({ type: "SET_MESSAGE", payload: null });
                setEmail("");
                setPassword("");
              }}
            ></button>
          </div>
          <div className="modal-body">
            <input
              className="form-control mb-2"
              type="email"
              placeholder="Email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="form-control mb-2"
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-success w-100">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
