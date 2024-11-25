import { buildCollection, EntityIdUpdateProps } from "@firecms/core";

export const ingredientsCollection = buildCollection({
    id: "ingredients",
    path: "ingredients",
    name: "Ingredients",
    singularName: "Ingredient",
    icon: "egg",
    previewProperties: ["name"],
    textSearchEnabled: true,
    callbacks: {
      onIdUpdate(idUpdateProps: EntityIdUpdateProps): string | Promise<string> {

          // @ts-ignore
          if(!idUpdateProps.values.name)
              return "_";
        // @ts-ignore
          return idUpdateProps.values.name.toLowerCase().replace(/ /g, "_").replace(/\//g, "_");
      }
    },
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            validation: { required: true }
        },
        description: {
            dataType: "string",
            name: "Description"
        }
    }
});
