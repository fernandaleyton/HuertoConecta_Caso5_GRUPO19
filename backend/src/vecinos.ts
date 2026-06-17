// src/routes/vecinos.ts
// CRUD completo para vecinos del huerto

import { Router, Request, Response } from 'express';
import pool from './pool';

const router = Router();

// GET /api/vecinos - Listar todos los vecinos
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT v.*, r.nombre AS rol
      FROM vecinos v
      JOIN roles r ON r.id_rol = v.id_rol
      ORDER BY v.apellido, v.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener vecinos', detail: err });
  }
});

// GET /api/vecinos/:id - Obtener un vecino
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT v.*, r.nombre AS rol
      FROM vecinos v
      JOIN roles r ON r.id_rol = v.id_rol
      WHERE v.id_vecino = $1
    `, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Vecino no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener vecino', detail: err });
  }
});

// POST /api/vecinos - Crear vecino
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, email, telefono, id_rol } = req.body;
    const result = await pool.query(`
      INSERT INTO vecinos (nombre, apellido, email, telefono, id_rol)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [nombre, apellido, email, telefono, id_rol]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear vecino', detail: err });
  }
});

// PUT /api/vecinos/:id - Actualizar vecino
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, id_rol, activo } = req.body;
    const result = await pool.query(`
      UPDATE vecinos
      SET nombre=$1, apellido=$2, email=$3, telefono=$4, id_rol=$5, activo=$6
      WHERE id_vecino=$7
      RETURNING *
    `, [nombre, apellido, email, telefono, id_rol, activo, id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Vecino no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar vecino', detail: err });
  }
});

// DELETE /api/vecinos/:id - Desactivar vecino (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE vecinos SET activo=FALSE WHERE id_vecino=$1', [id]);
    res.json({ message: 'Vecino desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar vecino', detail: err });
  }
});

export default router;
