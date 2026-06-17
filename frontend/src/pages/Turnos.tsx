// src/pages/Turnos.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Usuario } from '../App';

export default function Turnos({ usuario }: { usuario: Usuario }) {
  const [turnos, setTurnos]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState<number | null>(null);
  const [fecha, setFecha]     = useState(new Date().toISOString().split('T')[0]);

  const cargar = async () => {
    setLoading(true);
    try { setTurnos(await api.getTurnos(fecha)); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, [fecha]);

  const completar = async (id: number) => {
    setMarcando(id);
    try {
      await api.completarTurno(id);
      await cargar();
    } finally { setMarcando(null); }
  };

  const pendientes  = turnos.filter(t => !t.completado);
  const completados = turnos.filter(t => t.completado);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">💧 Turnos de Riego</div>
        <div className="page-subtitle">Registra y controla los riegos del huerto</div>
      </div>

      <div className="form-group">
        <label>Ver turnos del día</label>
        <input type="date" className="form-control" value={fecha}
          onChange={e => setFecha(e.target.value)} />
      </div>

      {loading
        ? <div className="loading">Cargando turnos...</div>
        : <>
          {/* Pendientes */}
          <div className="section-title">⏳ Pendientes ({pendientes.length})</div>
          {pendientes.length === 0
            ? <div className="card card-palido"><p style={{ textAlign: 'center', color: 'var(--verde-oscuro)', fontWeight: 700 }}>✅ ¡Todos los riegos completados!</p></div>
            : pendientes.map((t: any) => (
              <div key={t.id_turno} className="turno-item">
                <div className="turno-parcela">{t.parcela}</div>
                <div className="turno-info">
                  <div className="turno-nombre">{t.vecino}</div>
                  <div className="turno-tel">{t.telefono}</div>
                </div>
                {(t.id_vecino === usuario.id_vecino || usuario.id_rol === 1) && (
                  <button className="btn btn-primary btn-sm"
                    disabled={marcando === t.id_turno}
                    onClick={() => completar(t.id_turno)}>
                    {marcando === t.id_turno ? '...' : '✓'}
                  </button>
                )}
              </div>
            ))
          }

          {/* Completados */}
          {completados.length > 0 && (
            <>
              <div className="section-title">✅ Completados ({completados.length})</div>
              {completados.map((t: any) => (
                <div key={t.id_turno} className="turno-item" style={{ opacity: 0.7 }}>
                  <div className="turno-parcela" style={{ background: 'var(--verde-claro)' }}>{t.parcela}</div>
                  <div className="turno-info">
                    <div className="turno-nombre">{t.vecino}</div>
                    {t.hora_completado && <div className="turno-tel">Completado a las {t.hora_completado}</div>}
                    {t.observacion && <div className="turno-tel">📝 {t.observacion}</div>}
                  </div>
                  <span className="badge badge-verde">✓ Listo</span>
                </div>
              ))}
            </>
          )}
        </>
      }
    </div>
  );
}
