// src/App.tsx
import React, { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Turnos from "./pages/Turnos";
import Parcelas from "./pages/Parcelas";
import Cosechas from "./pages/Cosechas";
import Participacion from "./pages/Participacion";
import Observaciones from "./pages/Observaciones";
import Navbar from "./components/Navbar";
import "./index.css";

export type Page = "dashboard" | "turnos" | "parcelas" | "cosechas" | "participacion" | "observaciones";

export type Usuario = { id_vecino: number; nombre: string; apellido: string; id_rol: number };

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [page, setPage] = useState<Page>("dashboard");

  if (!usuario) return <Login onLogin={setUsuario} />;

  const renderPage = () => {
    switch (page) {
      case "dashboard":     return <Dashboard usuario={usuario} />;
      case "turnos":        return <Turnos usuario={usuario} />;
      case "parcelas":      return <Parcelas />;
      case "cosechas":      return <Cosechas usuario={usuario} />;
      case "participacion": return <Participacion />;
      case "observaciones": return <Observaciones usuario={usuario} />;
    }
  };

  return (
    <div className="app">
      <Navbar page={page} setPage={setPage} usuario={usuario} onLogout={() => setUsuario(null)} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
