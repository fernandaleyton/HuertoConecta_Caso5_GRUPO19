// src/pages/Participacion.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Participacion() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(d => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando participación...</div>;

  const vecinos = data?.participacion || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">👥 Participación</div>
        <div className="page-subtitle">Actividad de cada vecino del huerto</div>
      </div>

      {vecinos.map((v: any, i: number) => {
        const pct = parseFloat(v.porcentaje_cumplimiento) || 0;
        const color = pct >= 80 ? 'var(--verde-medio)' : pct >= 50 ? 'var(--naranja)' : 'var(--rojo-alerta)';
        return (
          <div key={i} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}.`} {v.vecino}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  {v.turnos_cumplidos}/{v.turnos_asignados} turnos cumplidos
                  {v.turnos_perdidos > 0 && ` · ${v.turnos_perdidos} perdidos`}
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color }}>{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      })}

      {vecinos.length === 0 && <div className="empty">Sin datos de participación aún.</div>}
    </div>
  );
}
