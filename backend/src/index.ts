// src/index.ts
// Servidor principal HuertoConecta API

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import vecinosRouter from './vecinos';
import parcelasRouter from './parcelas';
import siembrasRouter from './siembras';
import turnosRouter from './turnos';
import cosechasRouter from './cosechas';
import observacionesRouter from './observaciones';
import dashboardRouter from './dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/vecinos',       vecinosRouter);
app.use('/api/parcelas',      parcelasRouter);
app.use('/api/siembras',      siembrasRouter);
app.use('/api/turnos',        turnosRouter);
app.use('/api/cosechas',      cosechasRouter);
app.use('/api/observaciones', observacionesRouter);
app.use('/api/dashboard',     dashboardRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', proyecto: 'HuertoConecta', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🌱 HuertoConecta API corriendo en http://localhost:${PORT}`);
});

export default app;
