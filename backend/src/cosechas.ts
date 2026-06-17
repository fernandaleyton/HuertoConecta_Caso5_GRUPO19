// src/routes/cosechas.ts
import { Router, Request, Response } from 'express';
import pool from './pool';

const router = Router();

router.get('/', async (_req, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT co.*, c.nombre AS cultivo, p.codigo AS parcela,
             v.nombre || ' ' || v.apellido AS vecino_cosechador
      FROM cosechas co
      JOIN siembras s ON s.id_siembra = co.id_siembra
      JOIN cultivos c ON c.id_cultivo = s.id_cultivo
      JOIN parcelas p ON p.id_parcela = s.id_parcela
      JOIN vecinos  v ON v.id_vecino  = co.id_vecino
      ORDER BY co.fecha_cosecha DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { id_siembra, id_vecino, fecha_cosecha, cantidad, unidad, notas } = req.body;
    const result = await pool.query(`
      INSERT INTO cosechas (id_siembra, id_vecino, fecha_cosecha, cantidad, unidad, notas)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [id_siembra, id_vecino, fecha_cosecha, cantidad, unidad || 'kg', notas]);
    // Marcar siembra como cosechada
    await pool.query("UPDATE siembras SET estado='cosechado' WHERE id_siembra=$1", [id_siembra]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error al registrar cosecha', detail: err }); }
});

router.get('/mes', async (_req, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM v_cosecha_mes`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM cosechas WHERE id_cosecha=$1', [req.params.id]);
    res.json({ message: 'Cosecha eliminada' });
  } catch (err) { res.status(500).json({ error: 'Error', detail: err }); }
});

export default router;
