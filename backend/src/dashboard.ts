// src/routes/dashboard.ts
// Endpoint central del dashboard comunitario HuertoConecta

import { Router, Response } from 'express';
import pool from './pool';

const router = Router();

// GET /api/dashboard
// Responde las 3 preguntas clave del caso:
// 1. ¿Qué parcelas necesitan riego hoy y quién es el responsable?
// 2. ¿Cuánto se ha cosechado este mes y cómo se reparte?
// 3. ¿Qué vecinos están más activos y cuáles no cumplen sus turnos?
router.get('/', async (_req, res: Response) => {
  try {
    // --- 1. Turnos de hoy ---
    const turnosHoy = await pool.query(`SELECT * FROM v_turnos_hoy`);

    // --- 2. Cosecha del mes ---
    const cosechaMes = await pool.query(`SELECT * FROM v_cosecha_mes`);

    // --- 2b. Total cosechado en kg equivalente del mes ---
    const totalMes = await pool.query(`
      SELECT COUNT(*) AS num_cosechas,
             SUM(cantidad) AS total_cantidad
      FROM cosechas
      WHERE DATE_TRUNC('month', fecha_cosecha) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // --- 3. Ranking de participación ---
    const participacion = await pool.query(`SELECT * FROM v_participacion_vecinos`);

    // --- 4. Resumen general ---
    const resumen = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM vecinos WHERE activo=TRUE AND id_rol != 3)  AS vecinos_activos,
        (SELECT COUNT(*) FROM parcelas WHERE estado='ocupada')             AS parcelas_ocupadas,
        (SELECT COUNT(*) FROM parcelas WHERE estado='disponible')         AS parcelas_disponibles,
        (SELECT COUNT(*) FROM siembras WHERE estado='en_curso')           AS cultivos_en_curso,
        (SELECT COUNT(*) FROM turnos_riego
         WHERE fecha_turno=CURRENT_DATE AND completado=FALSE)             AS turnos_pendientes_hoy,
        (SELECT COUNT(*) FROM turnos_riego
         WHERE fecha_turno=CURRENT_DATE AND completado=TRUE)              AS turnos_completados_hoy
    `);

    // --- 5. Próximas cosechas estimadas ---
    const proximasCosechas = await pool.query(`
      SELECT s.fecha_cosecha_estimada, c.nombre AS cultivo,
             p.codigo AS parcela,
             v.nombre || ' ' || v.apellido AS responsable,
             s.fecha_cosecha_estimada - CURRENT_DATE AS dias_restantes
      FROM siembras s
      JOIN cultivos c ON c.id_cultivo = s.id_cultivo
      JOIN parcelas p ON p.id_parcela = s.id_parcela
      JOIN vecinos  v ON v.id_vecino  = s.id_vecino
      WHERE s.estado='en_curso'
        AND s.fecha_cosecha_estimada >= CURRENT_DATE
      ORDER BY s.fecha_cosecha_estimada ASC
      LIMIT 5
    `);

    // --- 6. Últimas observaciones ---
    const ultimasObservaciones = await pool.query(`
      SELECT o.tipo, o.descripcion, o.fecha,
             v.nombre || ' ' || v.apellido AS vecino,
             p.codigo AS parcela
      FROM observaciones o
      JOIN vecinos v ON v.id_vecino = o.id_vecino
      LEFT JOIN parcelas p ON p.id_parcela = o.id_parcela
      ORDER BY o.fecha DESC
      LIMIT 5
    `);

    res.json({
      resumen:              resumen.rows[0],
      turnos_hoy:           turnosHoy.rows,
      cosecha_mes:          cosechaMes.rows,
      total_mes:            totalMes.rows[0],
      participacion:        participacion.rows,
      proximas_cosechas:    proximasCosechas.rows,
      ultimas_observaciones: ultimasObservaciones.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar dashboard', detail: err });
  }
});

export default router;
