// src/pages/Parcelas.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const ESTADO_COLOR: Record<string, string> = {
  ocupada: 'badge-verde', disponible: 'badge-naranja', en_descanso: 'badge-rojo'
};

export default function Parcelas() {
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.getParcelas().then(setParcelas).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando parcelas...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🌱 Parcelas</div>
        <div className="page-subtitle">{parcelas.length} parcelas en el huerto</div>
      </div>

      {parcelas.map((p: any) => (
        <div key={p.id_parcela} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--verde-oscuro)' }}>
                Parcela {p.codigo}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 2 }}>{p.descripcion}</div>
              {p.responsable && (
                <div style={{ fontSize: '0.85rem', marginTop: 6 }}>
                  👤 <strong>{p.responsable}</strong>
                </div>
              )}
              {p.area_m2 && (
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>📐 {p.area_m2} m²</div>
              )}
            </div>
            <span className={`badge ${ESTADO_COLOR[p.estado] || 'badge-verde'}`}>
              {p.estado.replace('_', ' ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
