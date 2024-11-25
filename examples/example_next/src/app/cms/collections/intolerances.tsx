import { buildCollection, EntityIdUpdateProps } from "@firecms/core";

export const intolerancesCollection = buildCollection({
    id: "intolerances",
    path: "intolerances",
    name: "Intolerances",
    icon: "warning",
    textSearchEnabled: true,
    callbacks: {
        onIdUpdate(idUpdateProps: EntityIdUpdateProps): string | Promise<string> {

            // @ts-ignore
            if (!idUpdateProps.values.name)
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
        },
        filterName: {
            dataType: "string",
            name: "Filter name",
            description: "Name used in the filter dropdown, to indicate recipes that accept this intolerance. Example: 'Gluten Free'",
        }
    }
});
