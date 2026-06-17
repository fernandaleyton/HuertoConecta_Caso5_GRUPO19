// src/components/Navbar.tsx
import React from "react";
import { Page, Usuario } from "../App";

const TABS: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard',     icon: '🏡', label: 'Inicio' },
  { id: 'turnos',        icon: '💧', label: 'Turnos' },
  { id: 'parcelas',      icon: '🌱', label: 'Parcelas' },
  { id: 'cosechas',      icon: '🥬', label: 'Cosechas' },
  { id: 'participacion', icon: '👥', label: 'Vecinos' },
  { id: 'observaciones', icon: '📝', label: 'Notas' },
];

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  usuario: Usuario;
  onLogout: () => void;
}

export default function Navbar({ page, setPage, usuario, onLogout }: Props) {
  return (
    <>
      <div className="topbar">
        <div className="topbar-logo">🌿 HuertoConecta</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="topbar-user">{usuario.nombre}</span>
          <button
            onClick={onLogout}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                     borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
          >Salir</button>
        </div>
      </div>
      <nav className="navbar">
        {TABS.map(t => (
          <button key={t.id} className={`nav-item ${page === t.id ? 'active' : ''}`} onClick={() => setPage(t.id)}>
            <span className="nav-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
