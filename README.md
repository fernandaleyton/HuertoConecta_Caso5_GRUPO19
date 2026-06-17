# 🌿 HuertoConecta

Sistema de gestión para el huerto urbano comunitario.  
**Proyecto:** Caso 05 "Huerto Herido" — Sistemas de Información, UCN 2026.

## Estructura del repositorio

```
/
├── db/
│   └── huertoconecta.sql        # Script DDL + DML para PostgreSQL
├── backend/
│   ├── src/
│   │   ├── db/pool.ts
│   │   ├── routes/
│   │   │   ├── dashboard.ts
│   │   │   ├── vecinos.ts
│   │   │   ├── parcelas.ts
│   │   │   ├── siembras.ts
│   │   │   ├── turnos.ts
│   │   │   ├── cosechas.ts
│   │   │   └── observaciones.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/Navbar.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Turnos.tsx
│   │   │   ├── Parcelas.tsx
│   │   │   ├── Cosechas.tsx
│   │   │   ├── Participacion.tsx
│   │   │   └── Observaciones.tsx
│   │   ├── services/api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── docs/
    └── bitacora-prompts.md      # Bitácora de Prompt Engineering
```

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Base de datos | PostgreSQL 14+ |
| Backend | Node.js + TypeScript + Express |
| Frontend | React 18 + TypeScript + Vite |
| Estilos | CSS puro con variables (mobile-first) |

## Arranque rápido

```bash
# 1. Base de datos
psql -U postgres -c "CREATE DATABASE huertoconecta;"
psql -U postgres -d huertoconecta -f db/huertoconecta.sql

# 2. Backend
cd backend && cp .env.example .env  # editar credenciales
npm install && npm run dev           # http://localhost:3001

# 3. Frontend (nueva terminal)
cd frontend && npm install && npm run dev  # http://localhost:5173
```

## Preguntas del dashboard respondidas

1. ✅ **¿Qué parcelas necesitan riego hoy y quién es el responsable?** → `GET /api/turnos/hoy`
2. ✅ **¿Cuánto se ha cosechado este mes y cómo se reparte?** → `GET /api/cosechas/mes`
3. ✅ **¿Qué vecinos están más activos y cuáles no cumplen sus turnos?** → vista `v_participacion_vecinos`
