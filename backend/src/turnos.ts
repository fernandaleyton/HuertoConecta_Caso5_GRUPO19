// src/routes/turnos.ts
import { Router, Request, Response } from 'express';
import pool from './pool';

const router = Router();

// GET /api/turnos?fecha=YYYY-MM-DD
router.get('/', async (req: Request, res: Response) => {
  try {
    const { fecha } = req.query;
    let query = `
      SELECT t.*, p.codigo AS parcela, v.nombre || ' ' || v.apellido AS vecino, v.telefono
      FROM turnos_riego t
      JOIN parcelas p ON p.id_parcela = t.id_parcela
      JOIN vecinos  v ON v.id_vecino  = t.id_vecino
    `;
    const params: string[] = [];
    if (fecha) {
      query += ' WHERE t.fecha_turno=$1';
      params.push(fecha as string);
    }
    query += ' ORDER BY t.fecha_turno DESC, p.codigo ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

// GET /api/turnos/hoy
router.get('/hoy', async (_req, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM v_turnos_hoy`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

// POST /api/turnos
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id_parcela, id_vecino, fecha_turno } = req.body;
    const result = await pool.query(`
      INSERT INTO turnos_riego (id_parcela, id_vecino, fecha_turno)
      VALUES ($1,$2,$3) RETURNING *
    `, [id_parcela, id_vecino, fecha_turno]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error al crear turno', detail: err }); }
});

// PATCH /api/turnos/:id/completar - Marcar turno como cumplido
router.patch('/:id/completar', async (req: Request, res: Response) => {
  try {
    const { observacion } = req.body;
    const result = await pool.query(`
      UPDATE turnos_riego
      SET completado=TRUE, hora_completado=CURRENT_TIME, observacion=$1
      WHERE id_turno=$2 RETURNING *
    `, [observacion || null, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Turno no encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

// DELETE /api/turnos/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM turnos_riego WHERE id_turno=$1', [req.params.id]);
    res.json({ message: 'Turno eliminado' });
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

export default router;
