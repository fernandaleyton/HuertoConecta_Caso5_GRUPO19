// src/routes/parcelas.ts
// CRUD completo para parcelas del huerto

import { Router, Request, Response } from 'express';
import pool from './pool';

const router = Router();

// GET /api/parcelas
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
             v.nombre || ' ' || v.apellido AS responsable
      FROM parcelas p
      LEFT JOIN vecinos v ON v.id_vecino = p.id_vecino_responsable
      ORDER BY p.codigo
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener parcelas', detail: err });
  }
});

// GET /api/parcelas/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
             v.nombre || ' ' || v.apellido AS responsable,
             json_agg(
               json_build_object(
                 'cultivo', c.nombre,
                 'fecha_siembra', s.fecha_siembra,
                 'estado', s.estado
               )
             ) FILTER (WHERE s.id_siembra IS NOT NULL) AS siembras_activas
      FROM parcelas p
      LEFT JOIN vecinos  v ON v.id_vecino  = p.id_vecino_responsable
      LEFT JOIN siembras s ON s.id_parcela = p.id_parcela AND s.estado = 'en_curso'
      LEFT JOIN cultivos c ON c.id_cultivo = s.id_cultivo
      WHERE p.id_parcela = $1
      GROUP BY p.id_parcela, v.nombre, v.apellido
    `, [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Parcela no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener parcela', detail: err });
  }
});

// POST /api/parcelas
router.post('/', async (req: Request, res: Response) => {
  try {
    const { codigo, descripcion, area_m2, estado, id_vecino_responsable } = req.body;
    const result = await pool.query(`
      INSERT INTO parcelas (codigo, descripcion, area_m2, estado, id_vecino_responsable)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [codigo, descripcion, area_m2, estado || 'disponible', id_vecino_responsable]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear parcela', detail: err });
  }
});

// PUT /api/parcelas/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { codigo, descripcion, area_m2, estado, id_vecino_responsable } = req.body;
    const result = await pool.query(`
      UPDATE parcelas SET codigo=$1, descripcion=$2, area_m2=$3, estado=$4, id_vecino_responsable=$5
      WHERE id_parcela=$6 RETURNING *
    `, [codigo, descripcion, area_m2, estado, id_vecino_responsable, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Parcela no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar parcela', detail: err });
  }
});

// DELETE /api/parcelas/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM parcelas WHERE id_parcela=$1', [req.params.id]);
    res.json({ message: 'Parcela eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar parcela', detail: err });
  }
});

export default router;
