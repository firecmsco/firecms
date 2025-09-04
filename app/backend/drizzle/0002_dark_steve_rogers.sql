-- For the "alquileres" table
CREATE SEQUENCE IF NOT EXISTS alquileres_id_seq;
ALTER TABLE "alquileres" ALTER COLUMN "id" SET DEFAULT nextval('alquileres_id_seq');
ALTER SEQUENCE alquileres_id_seq OWNED BY "alquileres"."id";
SELECT setval('alquileres_id_seq', COALESCE((SELECT MAX(id) FROM "alquileres"), 1), false);
--> statement-breakpoint

-- For the "clientes" table
CREATE SEQUENCE IF NOT EXISTS clientes_id_seq;
ALTER TABLE "clientes" ALTER COLUMN "id" SET DEFAULT nextval('clientes_id_seq');
ALTER SEQUENCE clientes_id_seq OWNED BY "clientes"."id";
SELECT setval('clientes_id_seq', COALESCE((SELECT MAX(id) FROM "clientes"), 1), false);
--> statement-breakpoint

-- For the "control_diario" table
CREATE SEQUENCE IF NOT EXISTS control_diario_id_seq;
ALTER TABLE "control_diario" ALTER COLUMN "id" SET DEFAULT nextval('control_diario_id_seq');
ALTER SEQUENCE control_diario_id_seq OWNED BY "control_diario"."id";
SELECT setval('control_diario_id_seq', COALESCE((SELECT MAX(id) FROM "control_diario"), 1), false);
--> statement-breakpoint

-- For the "horas" table
CREATE SEQUENCE IF NOT EXISTS horas_id_seq;
ALTER TABLE "horas" ALTER COLUMN "id" SET DEFAULT nextval('horas_id_seq');
ALTER SEQUENCE horas_id_seq OWNED BY "horas"."id";
SELECT setval('horas_id_seq', COALESCE((SELECT MAX(id) FROM "horas"), 1), false);
--> statement-breakpoint

-- For the "implementos" table
CREATE SEQUENCE IF NOT EXISTS implementos_id_seq;
ALTER TABLE "implementos" ALTER COLUMN "id" SET DEFAULT nextval('implementos_id_seq');
ALTER SEQUENCE implementos_id_seq OWNED BY "implementos"."id";
SELECT setval('implementos_id_seq', COALESCE((SELECT MAX(id) FROM "implementos"), 1), false);
--> statement-breakpoint

-- For the "incidencias" table
CREATE SEQUENCE IF NOT EXISTS incidencias_id_seq;
ALTER TABLE "incidencias" ALTER COLUMN "id" SET DEFAULT nextval('incidencias_id_seq');
ALTER SEQUENCE incidencias_id_seq OWNED BY "incidencias"."id";
SELECT setval('incidencias_id_seq', COALESCE((SELECT MAX(id) FROM "incidencias"), 1), false);
--> statement-breakpoint

-- For the "mantenimiento" table
CREATE SEQUENCE IF NOT EXISTS mantenimiento_id_seq;
ALTER TABLE "mantenimiento" ALTER COLUMN "id" SET DEFAULT nextval('mantenimiento_id_seq');
ALTER SEQUENCE mantenimiento_id_seq OWNED BY "mantenimiento"."id";
SELECT setval('mantenimiento_id_seq', COALESCE((SELECT MAX(id) FROM "mantenimiento"), 1), false);
--> statement-breakpoint

-- For the "maquinaria" table
CREATE SEQUENCE IF NOT EXISTS maquinaria_id_seq;
ALTER TABLE "maquinaria" ALTER COLUMN "id" SET DEFAULT nextval('maquinaria_id_seq');
ALTER SEQUENCE maquinaria_id_seq OWNED BY "maquinaria"."id";
SELECT setval('maquinaria_id_seq', COALESCE((SELECT MAX(id) FROM "maquinaria"), 1), false);
