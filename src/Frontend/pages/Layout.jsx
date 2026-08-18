import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { Login } from "../components/Login.jsx";
import { Signup } from "../components/Signup.jsx";

export const Layout = () => {
  return (
    <>
      <Navbar />
      <Login loginModal="loginModal" />
      <Signup signupModal="signupModal" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
