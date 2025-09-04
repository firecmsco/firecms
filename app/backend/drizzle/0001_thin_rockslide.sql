CREATE TABLE "maquinaria_implementos" (
	"implemento_id" integer NOT NULL,
	"maquinaria_id" integer NOT NULL,
	CONSTRAINT "maquinaria_implementos_implemento_id_maquinaria_id_pk" PRIMARY KEY("implemento_id","maquinaria_id")
);
--> statement-breakpoint
ALTER TABLE "maquinaria_implementos" ADD CONSTRAINT "maquinaria_implementos_implemento_id_implementos_id_fk" FOREIGN KEY ("implemento_id") REFERENCES "public"."implementos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maquinaria_implementos" ADD CONSTRAINT "maquinaria_implementos_maquinaria_id_maquinaria_id_fk" FOREIGN KEY ("maquinaria_id") REFERENCES "public"."maquinaria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" DROP COLUMN "apellido";