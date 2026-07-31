import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";

export const Layout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
