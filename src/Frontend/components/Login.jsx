import { useState, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { toast } from "react-toastify";

export const Login = ({ id }) => {
  const { dispatch } = useGlobalReducer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Referencia para acceder al botón de cierre de manera limpia en React
  const closeBtnRef = useRef(null);

  const handleLogin = async (e) => {
    // Evita que la página se recargue al procesar el formulario
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

      setTimeout(() => {
        // Cierre del modal seguro usando la referencia de React
        if (closeBtnRef.current) closeBtnRef.current.click();
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
        {/* Envolvemos el contenido en un tag <form> */}
        <form className="modal-content" onSubmit={handleLogin}>
          <div className="modal-header">
            <h2 className="modal-title fs-5">Login</h2>
            <button
              type="button"
              ref={closeBtnRef} // Asignamos la referencia aquí
              className="btn-close"
              data-bs-dismiss="modal"
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
              autoComplete="username" // Ayuda a los gestores de contraseñas
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="form-control mb-2"
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password" // Ayuda a los gestores de contraseñas
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            {/* El botón ahora es tipo 'submit' para activar el formulario */}
            <button type="submit" className="btn btn-success w-100">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
