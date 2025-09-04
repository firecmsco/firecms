ALTER TABLE "alquileres" RENAME COLUMN "cliente_referencia" TO "cliente_relacionado";--> statement-breakpoint
ALTER TABLE "alquileres" DROP CONSTRAINT "alquileres_cliente_referencia_clientes_id_fk";
--> statement-breakpoint
ALTER TABLE "mantenimiento" ADD COLUMN "maquina_relacionada" integer;--> statement-breakpoint
ALTER TABLE "alquileres" ADD CONSTRAINT "alquileres_cliente_relacionado_clientes_id_fk" FOREIGN KEY ("cliente_relacionado") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mantenimiento" ADD CONSTRAINT "mantenimiento_maquina_relacionada_maquinaria_id_fk" FOREIGN KEY ("maquina_relacionada") REFERENCES "public"."maquinaria"("id") ON DELETE set null ON UPDATE no action;