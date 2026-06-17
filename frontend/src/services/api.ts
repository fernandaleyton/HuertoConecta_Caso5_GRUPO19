// src/services/api.ts
// Centraliza todas las llamadas al backend HuertoConecta

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

async function post(path: string, body: object) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

async function patch(path: string, body?: object) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

async function del(path: string) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => get('/dashboard'),

  // Vecinos
  getVecinos:   () => get('/vecinos'),
  getVecino:    (id: number) => get(`/vecinos/${id}`),
  createVecino: (data: object) => post('/vecinos', data),

  // Parcelas
  getParcelas:   () => get('/parcelas'),
  createParcela: (data: object) => post('/parcelas', data),

  // Siembras
  getSiembras:   () => get('/siembras'),
  createSiembra: (data: object) => post('/siembras', data),

  // Turnos
  getTurnosHoy:     () => get('/turnos/hoy'),
  getTurnos:        (fecha?: string) => get(fecha ? `/turnos?fecha=${fecha}` : '/turnos'),
  createTurno:      (data: object) => post('/turnos', data),
  completarTurno:   (id: number, obs?: string) => patch(`/turnos/${id}/completar`, { observacion: obs }),

  // Cosechas
  getCosechas:   () => get('/cosechas'),
  getCosechaMes: () => get('/cosechas/mes'),
  createCosecha: (data: object) => post('/cosechas', data),

  // Observaciones
  getObservaciones:   () => get('/observaciones'),
  createObservacion:  (data: object) => post('/observaciones', data),
  deleteObservacion:  (id: number) => del(`/observaciones/${id}`),

  // Login simulado (busca vecino por nombre)
  login: async (nombre: string, apellido: string) => {
    const vecinos = await get('/vecinos');
    return vecinos.find((v: any) =>
      v.nombre.toLowerCase() === nombre.toLowerCase() &&
      v.apellido.toLowerCase() === apellido.toLowerCase()
    ) || null;
  },
};
