CREATE TYPE "public"."alquileres_estado_pago" AS ENUM('pendiente', 'pagado', 'parcial');--> statement-breakpoint
CREATE TYPE "public"."alquileres_tipo_alquiler" AS ENUM('mensual', 'anual', 'diario');--> statement-breakpoint
CREATE TYPE "public"."horas_motivo_lectura" AS ENUM('salida_alquiler', 'devolucion_alquiler', 'mantenimiento', 'control_rutinario', 'fin_mes');--> statement-breakpoint
CREATE TYPE "public"."incidencias_gravedad" AS ENUM('baja', 'media', 'alta', 'critica');--> statement-breakpoint
CREATE TYPE "public"."incidencias_tipo_incidencia" AS ENUM('averia', 'accidente', 'uso_indebido', 'observacion', 'fallo_mecanico', 'fallo_hidraulico', 'fallo_electrico');--> statement-breakpoint
CREATE TYPE "public"."mantenimiento_tipo_mantenimiento" AS ENUM('preventivo', 'correctivo', 'cambio_aceite', 'cambio_filtros', 'revision_general', 'reparacion');--> statement-breakpoint
CREATE TYPE "public"."maquinaria_categoria" AS ENUM('manipuladoras_telescopicas', 'excavadoras', 'minicargadora_ruedas', 'dumpers_obra', 'grupos_electrogenos', 'cortadoras', 'martillos_picadores', 'maquinaria_jardineria', 'compresor_aire', 'plataformas_articuladas', 'plataformas_articuladas_electricas', 'plataformas_telescopicas', 'plataformas_tijera', 'plataformas_tijera_electricas', 'plataformas_unipersonales_electricas', 'plataformas_articulada_cadena', 'rodillos', 'carretillas_elevadoras');--> statement-breakpoint
CREATE TYPE "public"."maquinaria_estado_actual" AS ENUM('stock', 'alquilado', 'mantenimiento', 'parada', 'libre');--> statement-breakpoint
CREATE TABLE "alquileres" (
	"id" integer PRIMARY KEY NOT NULL,
	"maquina_referencia" integer NOT NULL,
	"cliente_referencia" integer NOT NULL,
	"tipo_alquiler" "alquileres_tipo_alquiler" NOT NULL,
	"precio_por_dia" numeric NOT NULL,
	"fecha_salida" timestamp with time zone NOT NULL,
	"fecha_devolucion_prevista" timestamp with time zone,
	"fecha_devolucion_real" timestamp with time zone,
	"situacion_obra" varchar NOT NULL,
	"horas_salida" numeric,
	"horas_devolucion" numeric,
	"implementos_incluidos" varchar,
	"activo" boolean,
	"notas" varchar,
	"total_facturado" numeric,
	"estado_pago" "alquileres_estado_pago"
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" integer PRIMARY KEY NOT NULL,
	"nombre" varchar NOT NULL,
	"apellido" varchar NOT NULL,
	"email" varchar NOT NULL,
	"telefono" varchar,
	"direccion" varchar,
	"ciudad" varchar,
	"pais" varchar,
	"fecha_registro" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "control_diario" (
	"id" integer PRIMARY KEY NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"facturacion_total" numeric,
	"facturacion_por_categoria" jsonb,
	"total_maquinas" numeric,
	"maquinas_alquiladas" numeric,
	"maquinas_disponibles" numeric,
	"maquinas_mantenimiento" numeric,
	"subcontratas" jsonb,
	"previsiones" jsonb,
	"notas_generales" varchar,
	"estado_implementos" jsonb
);
--> statement-breakpoint
CREATE TABLE "horas" (
	"id" integer PRIMARY KEY NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"horas_totales" numeric NOT NULL,
	"horas_periodo" numeric,
	"motivo_lectura" "horas_motivo_lectura",
	"operador" varchar,
	"notas" varchar,
	"alquiler_relacionado" integer
);
--> statement-breakpoint
CREATE TABLE "implementos" (
	"id" integer PRIMARY KEY NOT NULL,
	"nombre" varchar NOT NULL,
	"stock_total" integer,
	"stock_alquilado" integer,
	"stock_libre" integer
);
--> statement-breakpoint
CREATE TABLE "incidencias" (
	"id" integer PRIMARY KEY NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"tipo_incidencia" "incidencias_tipo_incidencia" NOT NULL,
	"gravedad" "incidencias_gravedad" NOT NULL,
	"descripcion" varchar NOT NULL,
	"reportado_por" varchar,
	"cliente_relacionado" integer,
	"alquiler_relacionado" integer,
	"solucion" varchar,
	"fecha_solucion" timestamp with time zone,
	"costo_reparacion" numeric,
	"responsable_cliente" boolean,
	"resuelto" boolean
);
--> statement-breakpoint
CREATE TABLE "mantenimiento" (
	"id" integer PRIMARY KEY NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"tipo_mantenimiento" "mantenimiento_tipo_mantenimiento" NOT NULL,
	"horas_maquina" numeric,
	"descripcion" varchar NOT NULL,
	"tecnico" varchar,
	"taller_externo" varchar,
	"costo" numeric,
	"proxima_revision" timestamp with time zone,
	"proxima_revision_horas" numeric,
	"repuestos_utilizados" varchar,
	"tiempo_parada" numeric,
	"urgente" boolean,
	"completado" boolean
);
--> statement-breakpoint
CREATE TABLE "maquinaria" (
	"id" integer PRIMARY KEY NOT NULL,
	"nombre" varchar NOT NULL,
	"imagen" varchar,
	"categoria" "maquinaria_categoria" NOT NULL,
	"modelo" varchar,
	"estado_actual" "maquinaria_estado_actual" NOT NULL,
	"notas" varchar,
	"horas_totales" numeric,
	"numero_serie" varchar,
	"ano_fabricacion" numeric,
	"fecha_ultima_lectura" timestamp with time zone,
	"alquiler_activo_id" varchar,
	"proximo_mantenimiento" timestamp with time zone,
	"fecha_adquisicion" timestamp with time zone,
	"precio_compra" numeric
);
--> statement-breakpoint
ALTER TABLE "alquileres" ADD CONSTRAINT "alquileres_maquina_referencia_maquinaria_id_fk" FOREIGN KEY ("maquina_referencia") REFERENCES "public"."maquinaria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alquileres" ADD CONSTRAINT "alquileres_cliente_referencia_clientes_id_fk" FOREIGN KEY ("cliente_referencia") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horas" ADD CONSTRAINT "horas_alquiler_relacionado_alquileres_id_fk" FOREIGN KEY ("alquiler_relacionado") REFERENCES "public"."alquileres"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_cliente_relacionado_clientes_id_fk" FOREIGN KEY ("cliente_relacionado") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_alquiler_relacionado_alquileres_id_fk" FOREIGN KEY ("alquiler_relacionado") REFERENCES "public"."alquileres"("id") ON DELETE set null ON UPDATE no action;