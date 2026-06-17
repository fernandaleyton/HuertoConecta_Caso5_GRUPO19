-- ============================================================
-- HuertoConecta - Script SQL para PostgreSQL
-- Proyecto: Caso 05 "Huerto Herido"
-- Curso: Sistemas de Información - Ingeniería Comercial UCN
-- Archivo: /db/huertoconecta.sql
-- ============================================================

-- ============================================================
-- SECCIÓN 1: LIMPIEZA (para re-ejecución segura)
-- ============================================================
DROP TABLE IF EXISTS observaciones CASCADE;
DROP TABLE IF EXISTS reparto_cosechas CASCADE;
DROP TABLE IF EXISTS cosechas CASCADE;
DROP TABLE IF EXISTS turnos_riego CASCADE;
DROP TABLE IF EXISTS siembras CASCADE;
DROP TABLE IF EXISTS cultivos CASCADE;
DROP TABLE IF EXISTS parcelas CASCADE;
DROP TABLE IF EXISTS vecinos CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================
-- SECCIÓN 2: DDL - CREACIÓN DE TABLAS
-- ============================================================

-- Tabla: roles
-- Define los roles posibles dentro del huerto comunitario
CREATE TABLE roles (
    id_rol      SERIAL PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla: vecinos
-- Registra a cada miembro del huerto urbano (18 vecinos)
CREATE TABLE vecinos (
    id_vecino   SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE,
    telefono    VARCHAR(20),
    id_rol      INT NOT NULL REFERENCES roles(id_rol),
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Tabla: parcelas
-- Representa cada espacio físico del huerto (ej: A1, A2, B1...)
CREATE TABLE parcelas (
    id_parcela  SERIAL PRIMARY KEY,
    codigo      VARCHAR(10) NOT NULL UNIQUE,   -- ej: 'A1', 'B3'
    descripcion VARCHAR(200),
    area_m2     NUMERIC(5,2),                  -- superficie en metros cuadrados
    estado      VARCHAR(20) NOT NULL DEFAULT 'disponible'
                CHECK (estado IN ('disponible','ocupada','en_descanso')),
    id_vecino_responsable INT REFERENCES vecinos(id_vecino)
);

-- Tabla: cultivos
-- Catálogo de tipos de plantas que se pueden sembrar
CREATE TABLE cultivos (
    id_cultivo  SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    dias_cosecha INT,                          -- días aproximados hasta cosechar
    unidad_medida VARCHAR(20) DEFAULT 'kg'     -- kg, unidades, manojos, etc.
);

-- Tabla: siembras
-- Registra qué se sembró, dónde, cuándo y quién lo hizo
CREATE TABLE siembras (
    id_siembra  SERIAL PRIMARY KEY,
    id_parcela  INT NOT NULL REFERENCES parcelas(id_parcela),
    id_cultivo  INT NOT NULL REFERENCES cultivos(id_cultivo),
    id_vecino   INT NOT NULL REFERENCES vecinos(id_vecino),
    fecha_siembra DATE NOT NULL,
    fecha_cosecha_estimada DATE,
    cantidad_sembrada NUMERIC(6,2),
    estado      VARCHAR(20) NOT NULL DEFAULT 'en_curso'
                CHECK (estado IN ('en_curso','cosechado','perdido')),
    notas       TEXT
);

-- Tabla: turnos_riego
-- Asigna y registra los turnos de riego por parcela y vecino
CREATE TABLE turnos_riego (
    id_turno    SERIAL PRIMARY KEY,
    id_parcela  INT NOT NULL REFERENCES parcelas(id_parcela),
    id_vecino   INT NOT NULL REFERENCES vecinos(id_vecino),
    fecha_turno DATE NOT NULL,
    completado  BOOLEAN NOT NULL DEFAULT FALSE,
    hora_completado TIME,
    observacion VARCHAR(300)
);

-- Tabla: cosechas
-- Registra cada evento de cosecha: qué, cuánto, quién y cuándo
CREATE TABLE cosechas (
    id_cosecha  SERIAL PRIMARY KEY,
    id_siembra  INT NOT NULL REFERENCES siembras(id_siembra),
    id_vecino   INT NOT NULL REFERENCES vecinos(id_vecino),  -- quien cosechó
    fecha_cosecha DATE NOT NULL,
    cantidad    NUMERIC(6,2) NOT NULL,
    unidad      VARCHAR(20) NOT NULL DEFAULT 'kg',
    notas       TEXT
);

-- Tabla: reparto_cosechas
-- Registra cómo se distribuyó la cosecha entre los vecinos
CREATE TABLE reparto_cosechas (
    id_reparto  SERIAL PRIMARY KEY,
    id_cosecha  INT NOT NULL REFERENCES cosechas(id_cosecha),
    id_vecino   INT NOT NULL REFERENCES vecinos(id_vecino),
    cantidad    NUMERIC(6,2) NOT NULL,
    unidad      VARCHAR(20) NOT NULL DEFAULT 'kg',
    fecha_reparto DATE NOT NULL
);

-- Tabla: observaciones
-- Registro libre de notas sobre el huerto, parcelas o vecinos
CREATE TABLE observaciones (
    id_observacion SERIAL PRIMARY KEY,
    id_vecino   INT NOT NULL REFERENCES vecinos(id_vecino),
    id_parcela  INT REFERENCES parcelas(id_parcela),         -- opcional
    fecha       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo        VARCHAR(30) NOT NULL DEFAULT 'general'
                CHECK (tipo IN ('general','problema','mejora','aviso')),
    descripcion TEXT NOT NULL
);

-- ============================================================
-- SECCIÓN 3: ÍNDICES para mejorar rendimiento en consultas
-- ============================================================
CREATE INDEX idx_turnos_fecha      ON turnos_riego(fecha_turno);
CREATE INDEX idx_turnos_parcela    ON turnos_riego(id_parcela);
CREATE INDEX idx_siembras_parcela  ON siembras(id_parcela);
CREATE INDEX idx_cosechas_fecha    ON cosechas(fecha_cosecha);
CREATE INDEX idx_observaciones_fecha ON observaciones(fecha);

-- ============================================================
-- SECCIÓN 4: DML - DATOS DE PRUEBA
-- ============================================================

-- ---- ROLES ----
INSERT INTO roles (nombre, descripcion) VALUES
('coordinador',  'Administra el huerto, asigna turnos y modera conflictos'),
('miembro',      'Vecino regular con parcela asignada'),
('observador',   'Vecino en lista de espera, sin parcela asignada aún');

-- ---- VECINOS (18 vecinos del barrio) ----
INSERT INTO vecinos (nombre, apellido, email, telefono, id_rol, fecha_ingreso) VALUES
('Carmen',    'Rodríguez',  'carmen@huerto.cl',    '+56912345001', 1, '2023-03-01'),
('Luis',      'Martínez',   'luis@huerto.cl',      '+56912345002', 2, '2023-03-01'),
('Ana',       'González',   'ana@huerto.cl',       '+56912345003', 2, '2023-03-01'),
('Pedro',     'Flores',     'pedro@huerto.cl',     '+56912345004', 2, '2023-03-15'),
('Sofía',     'Herrera',    'sofia@huerto.cl',     '+56912345005', 2, '2023-03-15'),
('Miguel',    'Castro',     'miguel@huerto.cl',    '+56912345006', 2, '2023-04-01'),
('Valentina', 'Morales',    'vale@huerto.cl',      '+56912345007', 2, '2023-04-01'),
('Jorge',     'Jiménez',    'jorge@huerto.cl',     '+56912345008', 2, '2023-04-10'),
('Pilar',     'Ruiz',       'pilar@huerto.cl',     '+56912345009', 2, '2023-04-10'),
('Andrés',    'Díaz',       'andres@huerto.cl',    '+56912345010', 2, '2023-05-01'),
('Marcela',   'Torres',     'marcela@huerto.cl',   '+56912345011', 2, '2023-05-01'),
('Felipe',    'Vargas',     'felipe@huerto.cl',    '+56912345012', 2, '2023-05-15'),
('Daniela',   'Muñoz',      'daniela@huerto.cl',   '+56912345013', 2, '2023-06-01'),
('Ricardo',   'Romero',     'ricardo@huerto.cl',   '+56912345014', 2, '2023-06-01'),
('Camila',    'Álvarez',    'camila@huerto.cl',    '+56912345015', 2, '2023-06-15'),
('Tomás',     'López',      'tomas@huerto.cl',     '+56912345016', 2, '2023-07-01'),
('Isabel',    'Soto',       'isabel@huerto.cl',    '+56912345017', 3, '2023-08-01'),
('Sebastián', 'Pinto',      'sebastian@huerto.cl', '+56912345018', 3, '2023-09-01');

-- ---- PARCELAS (12 parcelas del terreno) ----
INSERT INTO parcelas (codigo, descripcion, area_m2, estado, id_vecino_responsable) VALUES
('A1', 'Parcela norte esquina, buena luz mañana',   4.0,  'ocupada',      2),
('A2', 'Parcela norte centro',                       4.0,  'ocupada',      3),
('A3', 'Parcela norte, cerca del grifo',             3.5,  'ocupada',      4),
('B1', 'Parcela central izquierda',                  4.5,  'ocupada',      5),
('B2', 'Parcela central',                            4.5,  'ocupada',      6),
('B3', 'Parcela central derecha',                    4.5,  'ocupada',      7),
('C1', 'Parcela sur izquierda',                      5.0,  'ocupada',      8),
('C2', 'Parcela sur centro',                         5.0,  'ocupada',      9),
('C3', 'Parcela sur derecha, sombra parcial',        5.0,  'ocupada',      10),
('D1', 'Parcela fondo izquierda',                    3.0,  'ocupada',      11),
('D2', 'Parcela fondo centro',                       3.0,  'en_descanso',  12),
('D3', 'Parcela fondo derecha, tierra preparada',    3.0,  'disponible',   NULL);

-- ---- CULTIVOS ----
INSERT INTO cultivos (nombre, descripcion, dias_cosecha, unidad_medida) VALUES
('Tomate',        'Solanum lycopersicum, variedad cherry',  80,  'kg'),
('Lechuga',       'Lactuca sativa, variedad romana',        45,  'unidades'),
('Zanahoria',     'Daucus carota',                          90,  'kg'),
('Espinaca',      'Spinacia oleracea',                      40,  'manojos'),
('Cilantro',      'Coriandrum sativum',                     30,  'manojos'),
('Pimiento',      'Capsicum annuum',                        90,  'kg'),
('Rábano',        'Raphanus sativus',                       25,  'unidades'),
('Albahaca',      'Ocimum basilicum, aromática',            35,  'manojos'),
('Acelga',        'Beta vulgaris var. cicla',               50,  'manojos'),
('Cebollín',      'Allium fistulosum',                      60,  'manojos');

-- ---- SIEMBRAS ----
INSERT INTO siembras (id_parcela, id_cultivo, id_vecino, fecha_siembra, fecha_cosecha_estimada, cantidad_sembrada, estado, notas) VALUES
(1,  1, 2,  '2026-03-01', '2026-05-20', 12, 'en_curso',   'Tomates cherry en A1'),
(2,  2, 3,  '2026-03-15', '2026-04-29', 20, 'cosechado',  'Lechugas romanas, cosechadas en abril'),
(3,  3, 4,  '2026-03-10', '2026-06-08', 8,  'en_curso',   'Zanahorias en A3'),
(4,  4, 5,  '2026-03-20', '2026-04-29', 15, 'cosechado',  'Espinacas primera temporada'),
(5,  1, 6,  '2026-04-01', '2026-06-20', 10, 'en_curso',   'Segundo cultivo de tomates en B2'),
(6,  5, 7,  '2026-04-05', '2026-05-05', 30, 'cosechado',  'Cilantro abundante'),
(7,  6, 8,  '2026-04-10', '2026-07-09', 8,  'en_curso',   'Pimientos rojos en C1'),
(8,  7, 9,  '2026-04-15', '2026-05-10', 40, 'cosechado',  'Rábanos de temporada'),
(9,  8, 10, '2026-04-20', '2026-05-25', 25, 'en_curso',   'Albahaca para el grupo'),
(10, 9, 11, '2026-04-25', '2026-06-14', 20, 'en_curso',   'Acelgas en D1'),
(1,  2, 2,  '2026-04-01', '2026-05-16', 10, 'en_curso',   'Segunda siembra en A1 - lechuga'),
(3,  10,4,  '2026-04-12', '2026-06-11', 18, 'en_curso',   'Cebollín en A3');

-- ---- TURNOS DE RIEGO (últimos 30 días y próximos 7 días) ----
INSERT INTO turnos_riego (id_parcela, id_vecino, fecha_turno, completado, hora_completado, observacion) VALUES
-- Semana pasada - completados
(1,  2,  '2026-05-01', TRUE,  '08:30', 'Riego normal'),
(2,  3,  '2026-05-01', TRUE,  '09:00', NULL),
(3,  4,  '2026-05-02', TRUE,  '08:45', 'Tierra muy seca, riego doble'),
(4,  5,  '2026-05-02', TRUE,  '07:30', NULL),
(5,  6,  '2026-05-03', TRUE,  '08:00', NULL),
(6,  7,  '2026-05-03', FALSE, NULL,    'No se presentó'),
(7,  8,  '2026-05-04', TRUE,  '09:15', NULL),
(8,  9,  '2026-05-04', TRUE,  '08:00', NULL),
(9,  10, '2026-05-05', TRUE,  '07:45', NULL),
(10, 11, '2026-05-05', FALSE, NULL,    'Olvidó su turno'),
(1,  12, '2026-05-06', TRUE,  '08:20', NULL),
(2,  13, '2026-05-06', TRUE,  '09:30', NULL),
(3,  14, '2026-05-07', TRUE,  '08:10', NULL),
(4,  15, '2026-05-07', FALSE, NULL,    NULL),
(5,  16, '2026-05-08', TRUE,  '08:00', NULL),
-- Esta semana
(6,  2,  '2026-05-09', TRUE,  '07:50', NULL),
(7,  3,  '2026-05-09', TRUE,  '09:00', NULL),
(8,  4,  '2026-05-10', TRUE,  '08:30', NULL),
(9,  5,  '2026-05-10', FALSE, NULL,    NULL),
(10, 6,  '2026-05-11', TRUE,  '08:15', 'Riego con abono líquido'),
(1,  7,  '2026-05-11', TRUE,  '09:45', NULL),
(2,  8,  '2026-05-12', TRUE,  '08:00', NULL),
(3,  9,  '2026-05-12', TRUE,  '07:30', NULL),
-- Hoy (2026-05-13) - mix completados y pendientes
(4,  10, '2026-05-13', FALSE, NULL,    NULL),
(5,  11, '2026-05-13', FALSE, NULL,    NULL),
(6,  12, '2026-05-13', TRUE,  '08:00', 'Completado temprano'),
(7,  13, '2026-05-13', FALSE, NULL,    NULL),
(8,  14, '2026-05-13', FALSE, NULL,    NULL),
-- Próximos días
(9,  15, '2026-05-14', FALSE, NULL,    NULL),
(10, 16, '2026-05-14', FALSE, NULL,    NULL),
(1,  2,  '2026-05-15', FALSE, NULL,    NULL),
(2,  3,  '2026-05-15', FALSE, NULL,    NULL),
(3,  4,  '2026-05-16', FALSE, NULL,    NULL),
(4,  5,  '2026-05-16', FALSE, NULL,    NULL);

-- ---- COSECHAS ----
INSERT INTO cosechas (id_siembra, id_vecino, fecha_cosecha, cantidad, unidad, notas) VALUES
(2,  3,  '2026-04-29', 18.0, 'unidades', 'Lechugas grandes y sanas'),
(4,  5,  '2026-04-29', 4.5,  'manojos',  'Espinacas de primera calidad'),
(6,  7,  '2026-05-05', 12.0, 'manojos',  'Cilantro muy aromático'),
(8,  9,  '2026-05-10', 35.0, 'unidades', 'Rábanos bien desarrollados'),
(1,  2,  '2026-05-12', 3.2,  'kg',       'Primera tanda de tomates cherry'),
(11, 2,  '2026-05-12', 8.0,  'unidades', 'Lechugas de segunda siembra en A1');

-- ---- REPARTO DE COSECHAS ----
-- Cosecha 1 (lechugas): distribuida entre 6 vecinos activos
INSERT INTO reparto_cosechas (id_cosecha, id_vecino, cantidad, unidad, fecha_reparto) VALUES
(1, 2,  3, 'unidades', '2026-04-30'),
(1, 3,  3, 'unidades', '2026-04-30'),
(1, 4,  3, 'unidades', '2026-04-30'),
(1, 5,  3, 'unidades', '2026-04-30'),
(1, 6,  3, 'unidades', '2026-04-30'),
(1, 7,  3, 'unidades', '2026-04-30'),
-- Cosecha 2 (espinacas): 4 vecinos
(2, 2,  1, 'manojos',  '2026-04-30'),
(2, 3,  1, 'manojos',  '2026-04-30'),
(2, 5,  1, 'manojos',  '2026-04-30'),
(2, 8,  1, 'manojos',  '2026-04-30'),
-- Cosecha 3 (cilantro): 6 vecinos
(3, 3,  2, 'manojos',  '2026-05-06'),
(3, 4,  2, 'manojos',  '2026-05-06'),
(3, 7,  2, 'manojos',  '2026-05-06'),
(3, 8,  2, 'manojos',  '2026-05-06'),
(3, 9,  2, 'manojos',  '2026-05-06'),
(3, 10, 2, 'manojos',  '2026-05-06'),
-- Cosecha 4 (rábanos): 5 vecinos
(4, 2,  7, 'unidades', '2026-05-10'),
(4, 5,  7, 'unidades', '2026-05-10'),
(4, 9,  7, 'unidades', '2026-05-10'),
(4, 11, 7, 'unidades', '2026-05-10'),
(4, 12, 7, 'unidades', '2026-05-10'),
-- Cosecha 5 (tomates): todos los activos (parcial por peso)
(5, 2,  0.5, 'kg', '2026-05-12'),
(5, 3,  0.5, 'kg', '2026-05-12'),
(5, 6,  0.5, 'kg', '2026-05-12'),
(5, 8,  0.5, 'kg', '2026-05-12'),
(5, 10, 0.5, 'kg', '2026-05-12'),
(5, 13, 0.5, 'kg', '2026-05-12'),
(5, 14, 0.2, 'kg', '2026-05-12');

-- ---- OBSERVACIONES ----
INSERT INTO observaciones (id_vecino, id_parcela, tipo, descripcion) VALUES
(1, NULL, 'aviso',    'Reunión del huerto este sábado a las 10am en la entrada'),
(2, 1,    'problema', 'Las plantas de tomate en A1 muestran manchas amarillas en las hojas'),
(4, 3,    'mejora',   'Instalar malla para proteger las zanahorias de pájaros'),
(7, 6,    'problema', 'La parcela B3 necesita más tierra abonada antes de próxima siembra'),
(9, 8,    'general',  'Los rábanos salieron perfectos, repetir en próxima temporada'),
(11, 10,  'problema', 'Grifo cercano a D1 pierde agua, avisado a la municipalidad'),
(1, NULL, 'aviso',    'No recoger cosecha sin avisarlo en el grupo del sistema'),
(3, 2,    'mejora',   'Propongo hacer compostaje con los restos de la parcela A2'),
(6, 5,    'general',  'B2 creciendo muy bien, estimamos cosecha abundante en junio'),
(8, 7,    'problema', 'Alguien pisó las plántulas de pimiento en C1, favor tener cuidado');

-- ============================================================
-- SECCIÓN 5: VISTAS ÚTILES PARA EL DASHBOARD
-- ============================================================

-- Vista: parcelas que necesitan riego HOY con responsable
CREATE OR REPLACE VIEW v_turnos_hoy AS
SELECT
    t.id_turno,
    p.codigo         AS parcela,
    p.descripcion    AS desc_parcela,
    v.nombre || ' ' || v.apellido AS vecino_responsable,
    v.telefono,
    t.completado,
    t.hora_completado,
    t.observacion
FROM turnos_riego t
JOIN parcelas p ON p.id_parcela = t.id_parcela
JOIN vecinos  v ON v.id_vecino  = t.id_vecino
WHERE t.fecha_turno = CURRENT_DATE
ORDER BY t.completado ASC, p.codigo ASC;

-- Vista: cosecha total del mes actual
CREATE OR REPLACE VIEW v_cosecha_mes AS
SELECT
    c2.nombre        AS cultivo,
    SUM(c.cantidad)  AS total,
    c.unidad,
    COUNT(*)         AS num_cosechas
FROM cosechas c
JOIN siembras  s  ON s.id_siembra = c.id_siembra
JOIN cultivos  c2 ON c2.id_cultivo = s.id_cultivo
WHERE DATE_TRUNC('month', c.fecha_cosecha) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY c2.nombre, c.unidad
ORDER BY total DESC;

-- Vista: ranking de participación de vecinos (turnos cumplidos)
CREATE OR REPLACE VIEW v_participacion_vecinos AS
SELECT
    v.nombre || ' ' || v.apellido AS vecino,
    COUNT(*)                       AS turnos_asignados,
    SUM(CASE WHEN t.completado THEN 1 ELSE 0 END) AS turnos_cumplidos,
    SUM(CASE WHEN NOT t.completado THEN 1 ELSE 0 END) AS turnos_perdidos,
    ROUND(
        100.0 * SUM(CASE WHEN t.completado THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0), 1
    ) AS porcentaje_cumplimiento
FROM vecinos v
LEFT JOIN turnos_riego t ON t.id_vecino = v.id_vecino
WHERE v.id_rol != 3  -- excluye observadores
GROUP BY v.id_vecino, v.nombre, v.apellido
ORDER BY porcentaje_cumplimiento DESC NULLS LAST;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
