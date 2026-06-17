// src/pages/Cosechas.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Usuario } from '../App';

export default function Cosechas({ usuario }: { usuario: Usuario }) {
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [siembras, setSiembras] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ id_siembra: '', cantidad: '', unidad: 'kg', notas: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    const [c, s] = await Promise.all([api.getCosechas(), api.getSiembras()]);
    setCosechas(c);
    setSiembras(s.filter((s: any) => s.estado === 'en_curso'));
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    if (!form.id_siembra || !form.cantidad) return;
    setGuardando(true);
    try {
      await api.createCosecha({
        ...form, cantidad: parseFloat(form.cantidad),
        id_vecino: usuario.id_vecino,
        fecha_cosecha: new Date().toISOString().split('T')[0],
      });
      setModal(false);
      setForm({ id_siembra: '', cantidad: '', unidad: 'kg', notas: '' });
      await cargar();
    } finally { setGuardando(false); }
  };

  if (loading) return <div className="loading">Cargando cosechas...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">🥬 Cosechas</div>
          <div className="page-subtitle">Registro de lo recolectado</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Registrar</button>
      </div>

      {cosechas.length === 0
        ? <div className="empty">No hay cosechas registradas aún.</div>
        : cosechas.map((c: any) => (
          <div key={c.id_cosecha} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.cultivo} — Parcela {c.parcela}</div>
                <div style={{ fontSize: '0.82rem', color: '#888' }}>
                  {c.vecino_cosechador} · {new Date(c.fecha_cosecha).toLocaleDateString('es-CL')}
                </div>
                {c.notas && <div style={{ fontSize: '0.82rem', marginTop: 4 }}>📝 {c.notas}</div>}
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--verde-oscuro)', textAlign: 'right' }}>
                {c.cantidad}<br />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.unidad}</span>
              </div>
            </div>
          </div>
        ))
      }

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🥬 Registrar Cosecha</div>

            <div className="form-group">
              <label>Siembra</label>
              <select className="form-control" value={form.id_siembra}
                onChange={e => setForm({ ...form, id_siembra: e.target.value })}>
                <option value="">Selecciona un cultivo...</option>
                {siembras.map((s: any) => (
                  <option key={s.id_siembra} value={s.id_siembra}>
                    {s.cultivo} — Parcela {s.parcela}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad</label>
              <input type="number" className="form-control" placeholder="0.0" value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Unidad</label>
              <select className="form-control" value={form.unidad}
                onChange={e => setForm({ ...form, unidad: e.target.value })}>
                {['kg', 'unidades', 'manojos', 'cajas'].map(u =>
                  <option key={u} value={u}>{u}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Notas (opcional)</label>
              <input className="form-control" placeholder="Observaciones de la cosecha..."
                value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-full" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando...' : '✓ Registrar Cosecha'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
