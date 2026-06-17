// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Usuario } from '../App';

export default function Dashboard({ usuario }: { usuario: Usuario }) {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try { setData(await api.getDashboard()); }
    catch { /* mostrar error */ }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  if (loading) return <div className="loading">🌱 Cargando el huerto...</div>;
  if (!data)   return <div className="empty">No se pudo cargar el dashboard.</div>;

  const { resumen, turnos_hoy, cosecha_mes, proximas_cosechas, ultimas_observaciones } = data;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">¡Hola, {usuario.nombre}! 🌿</div>
        <div className="page-subtitle">Resumen del huerto comunitario</div>
      </div>

      {/* Stats principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{resumen.vecinos_activos}</div>
          <div className="stat-label">Vecinos activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{resumen.parcelas_ocupadas}</div>
          <div className="stat-label">Parcelas activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: resumen.turnos_pendientes_hoy > 0 ? '#E63946' : '#40916C' }}>
            {resumen.turnos_pendientes_hoy}
          </div>
          <div className="stat-label">Riegos pendientes hoy</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{resumen.cultivos_en_curso}</div>
          <div className="stat-label">Cultivos en curso</div>
        </div>
      </div>

      {/* Pregunta 1: Turnos de hoy */}
      <div className="section-title">💧 Riego de hoy</div>
      {turnos_hoy.length === 0
        ? <div className="card"><p style={{ color: '#888' }}>No hay turnos registrados para hoy.</p></div>
        : turnos_hoy.map((t: any) => (
          <div key={t.id_turno} className="turno-item">
            <div className="turno-parcela">{t.parcela}</div>
            <div className="turno-info">
              <div className="turno-nombre">{t.vecino_responsable}</div>
              <div className="turno-tel">{t.telefono}</div>
            </div>
            <span className={`badge ${t.completado ? 'badge-verde' : 'badge-rojo'}`}>
              {t.completado ? '✓ Listo' : 'Pendiente'}
            </span>
          </div>
        ))
      }

      {/* Pregunta 2: Cosecha del mes */}
      <div className="section-title">🥬 Cosecha del mes</div>
      {cosecha_mes.length === 0
        ? <div className="card"><p style={{ color: '#888' }}>Sin cosechas registradas este mes.</p></div>
        : cosecha_mes.map((c: any) => (
          <div key={c.cultivo} className="card card-palido" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>{c.cultivo}</span>
            <span style={{ fontWeight: 800, color: 'var(--verde-oscuro)', fontSize: '1.1rem' }}>
              {c.total} {c.unidad}
            </span>
          </div>
        ))
      }

      {/* Próximas cosechas */}
      {proximas_cosechas?.length > 0 && (
        <>
          <div className="section-title">📅 Próximas cosechas</div>
          {proximas_cosechas.map((p: any, i: number) => (
            <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{p.cultivo} — Parcela {p.parcela}</div>
                <div style={{ fontSize: '0.82rem', color: '#888' }}>{p.responsable}</div>
              </div>
              <span className="badge badge-naranja">en {p.dias_restantes}d</span>
            </div>
          ))}
        </>
      )}

      {/* Últimas observaciones */}
      {ultimas_observaciones?.length > 0 && (
        <>
          <div className="section-title">📝 Novedades</div>
          {ultimas_observaciones.map((o: any, i: number) => (
            <div key={i} className="card" style={{ borderLeft: '4px solid var(--verde-medio)', paddingLeft: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.vecino}
                {o.parcela && <span style={{ color: '#888', fontWeight: 400 }}> · Parcela {o.parcela}</span>}
              </div>
              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{o.descripcion}</div>
              <span className={`badge ${o.tipo === 'problema' ? 'badge-rojo' : o.tipo === 'aviso' ? 'badge-naranja' : 'badge-verde'}`}
                    style={{ marginTop: 6 }}>
                {o.tipo}
              </span>
            </div>
          ))}
        </>
      )}

      <button className="btn btn-secondary btn-full" style={{ marginTop: 8 }} onClick={cargar}>
        🔄 Actualizar
      </button>
    </div>
  );
}
