// src/routes/observaciones.ts
import { Router, Request, Response } from 'express';
import pool from './pool';

const router = Router();

router.get('/', async (_req, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT o.*, v.nombre || ' ' || v.apellido AS vecino, p.codigo AS parcela
      FROM observaciones o
      JOIN vecinos v ON v.id_vecino = o.id_vecino
      LEFT JOIN parcelas p ON p.id_parcela = o.id_parcela
      ORDER BY o.fecha DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { id_vecino, id_parcela, tipo, descripcion } = req.body;
    const result = await pool.query(`
      INSERT INTO observaciones (id_vecino, id_parcela, tipo, descripcion)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [id_vecino, id_parcela || null, tipo || 'general', descripcion]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error al crear observación', detail: err }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM observaciones WHERE id_observacion=$1', [req.params.id]);
    res.json({ message: 'Observación eliminada' });
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

export default router;
