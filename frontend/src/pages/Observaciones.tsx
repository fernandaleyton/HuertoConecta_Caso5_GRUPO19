// src/pages/Observaciones.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Usuario } from '../App';

const TIPOS = ['general', 'problema', 'mejora', 'aviso'];
const TIPO_EMOJI: Record<string, string> = { general: '📝', problema: '⚠️', mejora: '💡', aviso: '📢' };

export default function Observaciones({ usuario }: { usuario: Usuario }) {
  const [obs, setObs]         = useState<any[]>([]);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ id_parcela: '', tipo: 'general', descripcion: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    const [o, p] = await Promise.all([api.getObservaciones(), api.getParcelas()]);
    setObs(o); setParcelas(p); setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    if (!form.descripcion.trim()) return;
    setGuardando(true);
    try {
      await api.createObservacion({
        id_vecino: usuario.id_vecino,
        id_parcela: form.id_parcela || null,
        tipo: form.tipo,
        descripcion: form.descripcion,
      });
      setModal(false);
      setForm({ id_parcela: '', tipo: 'general', descripcion: '' });
      await cargar();
    } finally { setGuardando(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta observación?')) return;
    await api.deleteObservacion(id);
    await cargar();
  };

  if (loading) return <div className="loading">Cargando observaciones...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">📝 Observaciones</div>
          <div className="page-subtitle">Notas y avisos del huerto</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Nueva</button>
      </div>

      {obs.length === 0
        ? <div className="empty">No hay observaciones registradas.</div>
        : obs.map((o: any) => (
          <div key={o.id_observacion} className="card"
               style={{ borderLeft: `4px solid ${o.tipo === 'problema' ? 'var(--rojo-alerta)' : o.tipo === 'aviso' ? 'var(--naranja)' : 'var(--verde-medio)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {TIPO_EMOJI[o.tipo]} {o.vecino}
                  {o.parcela && <span style={{ color: '#888', fontWeight: 400 }}> · Parcela {o.parcela}</span>}
                </div>
                <div style={{ fontSize: '0.88rem', marginTop: 4 }}>{o.descripcion}</div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 4 }}>
                  {new Date(o.fecha).toLocaleString('es-CL')}
                </div>
              </div>
              {(o.id_vecino === usuario.id_vecino || usuario.id_rol === 1) && (
                <button onClick={() => eliminar(o.id_observacion)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '1rem', padding: '0 4px' }}>
                  ✕
                </button>
              )}
            </div>
          </div>
        ))
      }

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">📝 Nueva Observación</div>

            <div className="form-group">
              <label>Tipo</label>
              <select className="form-control" value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map(t => <option key={t} value={t}>{TIPO_EMOJI[t]} {t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Parcela (opcional)</label>
              <select className="form-control" value={form.id_parcela}
                onChange={e => setForm({ ...form, id_parcela: e.target.value })}>
                <option value="">Sin parcela específica</option>
                {parcelas.map((p: any) => (
                  <option key={p.id_parcela} value={p.id_parcela}>Parcela {p.codigo}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea className="form-control" rows={4}
                placeholder="Describe la situación, mejora o aviso..."
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                style={{ resize: 'none' }} />
            </div>
            <button className="btn btn-primary btn-full" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando...' : '✓ Publicar Observación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
