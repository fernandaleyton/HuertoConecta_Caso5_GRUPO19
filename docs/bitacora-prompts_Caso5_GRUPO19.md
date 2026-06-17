# Bitácora de Prompts — HuertoConecta
**Proyecto:** Caso 05 "Huerto Herido"  
**Curso:** Sistemas de Información — Ingeniería Comercial, UCN  
**Herramienta principal:** Claude (Anthropic)  
**Período:** Mayo 2026  

---

## Entrada 1 — Análisis de Requerimientos

| Campo | Detalle |
|-------|---------|
| **Fecha** | 13/05/2026 |
| **Herramienta** | Claude (claude.ai) |
| **Objetivo** | Extraer pain points, requerimientos funcionales y no funcionales del caso |

**Prompt usado:**
> "Estoy desarrollando el proyecto HuertoConecta, basado en el Caso 5 'Huerto Herido'. El caso describe un huerto urbano comunitario de 18 vecinos con problemas de coordinación: nadie recuerda quién regó, siembras duplicadas en el mismo espacio, cosechas tomadas sin aviso, y una coordinadora a punto de renunciar. Analiza el caso y extrae: (1) los principales dolores del cliente (pain points), (2) los requerimientos funcionales del sistema, (3) los requerimientos no funcionales, y (4) las entidades de datos clave."

**Resultado obtenido:**
- Pain points identificados: falta de registro de riegos, conflictos por siembras duplicadas, cosechas sin trazabilidad, comunicación caótica en WhatsApp, falta de visibilidad del estado del huerto.
- Requerimientos funcionales: registro de vecinos y roles, gestión de parcelas, registro de siembras, turnos de riego con check-in, registro de cosechas, dashboard comunitario, observaciones.
- Requerimientos no funcionales: acceso móvil, interfaz simple, datos en tiempo real.
- Entidades clave: vecinos, roles, parcelas, cultivos, siembras, turnos_riego, cosechas, reparto_cosechas, observaciones.

**Ajustes realizados:**
- Se añadió la entidad `reparto_cosechas` para responder la pregunta del dashboard sobre distribución de la cosecha entre miembros.
- Se separó `cultivos` como catálogo independiente para no duplicar datos en siembras.

---

## Entrada 2 — Diseño del Prototipo

| Campo | Detalle |
|-------|---------|
| **Fecha** | 13/05/2026 |
| **Herramienta** | Google Stitch |
| **Objetivo** | Crear prototipo interactivo de alta fidelidad con las 7 pantallas requeridas |

**Prompt usado en Stitch:**
> "Diseña una app mobile-first para gestión de huerto urbano comunitario. Paleta: verde oscuro (#2D6A4F), verde claro (#74C69D), beige (#F5F0E8) y blanco. Pantallas: Login, Dashboard con stats y turnos de hoy, Turnos de riego con check-in, Parcelas, Registro de cosecha, Participación de vecinos con ranking, Observaciones. Navegación inferior con 6 tabs."

**Resultado obtenido:**
- Prototipo interactivo con 7 pantallas vinculadas.
- Diseño mobile-first con paleta verde/beige consistente.
- Flujo de navegación: Login → Dashboard → cualquier sección vía navbar inferior.
- Enlace al prototipo: https://stitch.withgoogle.com/preview/9950167669717732926

**Ajustes realizados:**
- Se ajustó el dashboard para mostrar explícitamente las 3 preguntas del caso en la parte superior.
- Se añadió barra de progreso en la pantalla de participación.

---

## Entrada 3 — Creación de Base de Datos SQL

| Campo | Detalle |
|-------|---------|
| **Fecha** | 13/05/2026 |
| **Herramienta** | Claude (claude.ai) |
| **Objetivo** | Generar script DDL + DML completo para PostgreSQL |

**Prompt usado:**
> "Estoy desarrollando el proyecto HuertoConecta, basado en el Caso 5 'Huerto Herido'. Necesito que generes el script SQL para PostgreSQL. El sistema debe registrar vecinos, roles, parcelas, cultivos, siembras, turnos de riego, cosechas, reparto de cosechas y observaciones. Genera: (1) Script DDL para crear las tablas, (2) Claves primarias y foráneas, (3) Restricciones básicas con CHECK, (4) Script DML con datos de prueba para 18 vecinos, (5) Datos de prueba para parcelas, siembras, turnos, cosechas y observaciones. Incluye también vistas SQL para el dashboard."

**Resultado obtenido:**
- Script con 9 tablas: `roles`, `vecinos`, `parcelas`, `cultivos`, `siembras`, `turnos_riego`, `cosechas`, `reparto_cosechas`, `observaciones`.
- Claves foráneas con `REFERENCES` y `CASCADE`.
- Restricciones `CHECK` en campos `estado` y `tipo`.
- 18 vecinos con datos realistas, 12 parcelas, 12 siembras, 34 turnos de riego, 6 cosechas.
- 3 vistas SQL: `v_turnos_hoy`, `v_cosecha_mes`, `v_participacion_vecinos`.
- Índices en campos de búsqueda frecuente.

**Ajustes realizados:**
- Se añadió `DROP TABLE IF EXISTS ... CASCADE` al inicio para permitir re-ejecución segura del script.
- Se corrigió el orden de creación de tablas para respetar dependencias de claves foráneas (roles antes que vecinos, parcelas antes que siembras, etc.).
- Se añadieron datos de turnos para la fecha actual (2026-05-13) para que el dashboard muestre datos reales al momento de la demo.

---

## Entrada 4 — Desarrollo del Backend

| Campo | Detalle |
|-------|---------|
| **Fecha** | 13/05/2026 |
| **Herramienta** | Claude (claude.ai) |
| **Objetivo** | Generar API REST con Node.js + TypeScript + Express + PostgreSQL |

**Prompt usado:**
> "Ahora genera el backend para el proyecto HuertoConecta usando Node.js con TypeScript, Express y PostgreSQL. El backend debe conectarse a la base de datos creada anteriormente. Necesito: (1) Estructura de carpetas para /backend, (2) Archivo de conexión a PostgreSQL con pool, (3) Rutas para vecinos, parcelas, siembras, turnos de riego, cosechas y observaciones, (4) Controladores básicos CRUD, (5) Endpoint /api/dashboard con: parcelas que necesitan riego hoy, cosecha total del mes, vecinos más activos, turnos pendientes y cumplidos, (6) Instrucciones para ejecutar el backend."

**Resultado obtenido:**
- Archivo `pool.ts` con conexión a PostgreSQL usando `pg.Pool`.
- `index.ts` con Express, CORS, y registro de todas las rutas.
- 7 archivos de rutas: `vecinos.ts`, `parcelas.ts`, `siembras.ts`, `turnos.ts`, `cosechas.ts`, `observaciones.ts`, `dashboard.ts`.
- Endpoint `GET /api/dashboard` que devuelve las 3 respuestas clave del caso en un solo objeto JSON.
- Ruta especial `PATCH /api/turnos/:id/completar` para que los vecinos marquen su turno cumplido.
- `README.md` con instrucciones de instalación y tabla de endpoints.

**Ajustes realizados:**
- Se agregó endpoint `GET /api/turnos/hoy` como atajo a la vista `v_turnos_hoy` de la base de datos.
- Se añadió soft delete para vecinos (campo `activo = FALSE`) en lugar de eliminar el registro.
- Se incluyó actualización automática del estado de parcela a `'ocupada'` al crear una nueva siembra.
- Se añadió `GET /api/health` para verificar que el servidor esté corriendo antes de conectar el frontend.

---

## Entrada 5 — Desarrollo del Frontend

| Campo | Detalle |
|-------|---------|
| **Fecha** | 13/05/2026 |
| **Herramienta** | Claude (claude.ai) |
| **Objetivo** | Generar frontend React con las 7 pantallas basadas en el prototipo Stitch |

**Prompt usado:**
> "Ahora genera el frontend para HuertoConecta usando React. Debe basarse en el prototipo creado en Stitch. Pantallas requeridas: (1) Inicio de sesión, (2) Dashboard principal, (3) Turnos de riego, (4) Gestión de parcelas, (5) Registro de cosecha, (6) Participación de vecinos, (7) Observaciones. El diseño debe ser mobile-first, simple, claro y con colores verdes, beige y blanco. Debe conectarse al backend mediante fetch. Entrega la estructura de carpetas para /frontend."

**Resultado obtenido:**
- App React con TypeScript y Vite.
- Sistema de CSS con variables de color del design system (verde/beige/blanco).
- `App.tsx` con estado de autenticación y navegación entre páginas sin react-router.
- `Navbar.tsx` con navegación inferior de 6 tabs (mobile-first).
- `api.ts` centraliza todas las llamadas al backend con `fetch`.
- 7 páginas implementadas: `Login`, `Dashboard`, `Turnos`, `Parcelas`, `Cosechas`, `Participacion`, `Observaciones`.
- Modales de formulario para crear cosechas y observaciones.
- Dashboard responde visualmente las 3 preguntas del caso del enunciado.

**Ajustes realizados:**
- Se eliminó dependencia de `react-router-dom` y se implementó navegación mediante estado simple en `App.tsx` para simplificar el setup.
- Se añadió filtro por fecha en la pantalla de turnos para poder consultar días anteriores.
- Se implementó lógica de permisos básica: solo el vecino responsable o el coordinador pueden marcar turnos y eliminar observaciones.
- La pantalla de Participación se alimenta del endpoint del dashboard en lugar de una llamada separada.

---

## Entrada 6 — Corrección de Errores

| Campo | Detalle |
|-------|---------|
| **Fecha** | 13/05/2026 |
| **Herramienta** | Claude (claude.ai) |
| **Objetivo** | Corregir error de CORS y de tipos TypeScript en el backend |

**Prompt usado:**
> "El backend da error 'Cannot read properties of undefined (reading map)' en la ruta /api/dashboard cuando la tabla cosechas está vacía. También hay un error de TypeScript: 'Parameter req implicitly has an any type' en varios archivos de rutas. ¿Cómo lo corrijo?"

**Resultado obtenido:**
- Causa del error runtime: falta de `FILTER (WHERE ...)` en `json_agg` cuando no hay registros relacionados.
- Solución: añadir `.filter(Boolean)` en el frontend al iterar arrays del dashboard.
- Causa del error TypeScript: parámetros sin tipo explícito.
- Solución: importar `Request, Response` de `express` y tipar todos los parámetros.

**Ajustes realizados:**
- Se añadió manejo de arrays vacíos en el frontend con operador `|| []`.
- Se actualizaron todos los archivos de rutas para usar tipos explícitos `Request` y `Response`.

---

## Entrada 7 — Mejoras y Refactorización

| Campo | Detalle |
|-------|---------|
| **Fecha** | 13/05/2026 |
| **Herramienta** | Claude (claude.ai) |
| **Objetivo** | Mejorar la experiencia del usuario y optimizar consultas SQL |

**Prompt usado:**
> "El dashboard carga lento porque hace 6 queries separadas. ¿Cómo puedo optimizarlo? También quiero que la pantalla de Participación muestre colores distintos según el porcentaje: verde si >80%, naranja si 50-80%, rojo si <50%."

**Resultado obtenido:**
- Optimización: consolidar todas las queries del dashboard en una sola función asíncrona con `Promise.all` en lugar de `await` secuencial.
- Código CSS para colores dinámicos según umbral de porcentaje usando variables CSS.

**Ajustes realizados:**
- Se implementó `Promise.all` en el endpoint del dashboard para ejecutar las 6 queries en paralelo, reduciendo tiempo de respuesta estimado en ~60%.
- Se añadió lógica de color dinámico en el componente `Participacion.tsx` con umbrales verde/naranja/rojo.
- Se añadió botón "Actualizar" en el dashboard para recargar datos sin refrescar la página.

---

## Resumen de Iteraciones

| # | Área | Iteraciones | Principal aprendizaje |
|---|------|-------------|----------------------|
| 1 | Base de datos | 3 | El orden de creación de tablas importa por las FK |
| 2 | Backend | 4 | Tipar correctamente Request/Response evita errores en compilación |
| 3 | Frontend | 5 | Centralizar llamadas en `api.ts` facilita el mantenimiento |
| 4 | Dashboard | 2 | `Promise.all` es clave para no hacer queries secuenciales |
| 5 | CSS/Diseño | 2 | Variables CSS permiten mantener consistencia de colores |

---

*Bitácora generada con apoyo de Claude (Anthropic) como parte del proyecto HuertoConecta.*  
*Entregable del proyecto: Desarrollo de Soluciones Tecnológicas Asistidas por IA — UCN 2026.*
