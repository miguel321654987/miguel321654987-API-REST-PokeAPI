import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { Login } from "../components/Login.jsx";
import { Signup } from "../components/Signup.jsx";

export const Layout = () => {
  return (
    <>
      <Navbar />
      <Login id="loginModal" />
      <Signup id="signupModal" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
