// src/routes/siembras.ts
import { Router, Request, Response } from 'express';
import pool from './pool';

const router = Router();

router.get('/', async (_req, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT s.*, p.codigo AS parcela, c.nombre AS cultivo,
             v.nombre || ' ' || v.apellido AS vecino
      FROM siembras s
      JOIN parcelas p ON p.id_parcela = s.id_parcela
      JOIN cultivos c ON c.id_cultivo = s.id_cultivo
      JOIN vecinos  v ON v.id_vecino  = s.id_vecino
      ORDER BY s.fecha_siembra DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT s.*, p.codigo AS parcela, c.nombre AS cultivo,
             v.nombre || ' ' || v.apellido AS vecino
      FROM siembras s
      JOIN parcelas p ON p.id_parcela = s.id_parcela
      JOIN cultivos c ON c.id_cultivo = s.id_cultivo
      JOIN vecinos  v ON v.id_vecino  = s.id_vecino
      WHERE s.id_siembra=$1
    `, [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

router.post('/', async (req, res: Response) => {
  try {
    const { id_parcela, id_cultivo, id_vecino, fecha_siembra, fecha_cosecha_estimada, cantidad_sembrada, notas } = req.body;
    const result = await pool.query(`
      INSERT INTO siembras (id_parcela, id_cultivo, id_vecino, fecha_siembra, fecha_cosecha_estimada, cantidad_sembrada, notas)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [id_parcela, id_cultivo, id_vecino, fecha_siembra, fecha_cosecha_estimada, cantidad_sembrada, notas]);
    // Actualizar estado de parcela a ocupada
    await pool.query("UPDATE parcelas SET estado='ocupada' WHERE id_parcela=$1", [id_parcela]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error al crear siembra', detail: err }); }
});

router.put('/:id', async (req, res: Response) => {
  try {
    const { estado, notas, fecha_cosecha_estimada } = req.body;
    const result = await pool.query(`
      UPDATE siembras SET estado=$1, notas=$2, fecha_cosecha_estimada=$3
      WHERE id_siembra=$4 RETURNING *
    `, [estado, notas, fecha_cosecha_estimada, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

export default router;
