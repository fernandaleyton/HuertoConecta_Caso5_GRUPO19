// src/pages/Login.tsx
import React, { useState } from "react";
import { api } from '../services/api';
import { Usuario } from '../App';

export default function Login({ onLogin }: { onLogin: (u: Usuario) => void }) {
  const [nombre, setNombre]   = useState('');
  const [apellido, setApellido] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nombre.trim() || !apellido.trim()) { setError('Completa tu nombre y apellido'); return; }
    setLoading(true); setError('');
    try {
      const vecino = await api.login(nombre.trim(), apellido.trim());
      if (vecino) { onLogin(vecino); }
      else { setError('Vecino no encontrado. Verifica tu nombre y apellido.'); }
    } catch {
      setError('No se pudo conectar al servidor. Verifica que el backend esté corriendo.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>🌿</span>
          <h1>HuertoConecta</h1>
          <p>Sistema de gestión del huerto comunitario</p>
        </div>

        <div className="form-group">
          <label>Nombre</label>
          <input className="form-control" placeholder="Ej: Carmen" value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        <div className="form-group">
          <label>Apellido</label>
          <input className="form-control" placeholder="Ej: Rodríguez" value={apellido}
            onChange={e => setApellido(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        {error && (
          <div style={{ background: '#FFE0E0', color: '#C0392B', borderRadius: 8, padding: '10px 14px',
                        fontSize: '0.85rem', fontWeight: 600, marginBottom: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={loading}>
          {loading ? 'Entrando...' : '🌱 Entrar al Huerto'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: '#999' }}>
          Ingresa con el nombre registrado en el sistema
        </p>
      </div>
    </div>
  );
}
