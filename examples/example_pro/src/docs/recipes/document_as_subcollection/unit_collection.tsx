import { buildCollection } from "@firecms/core";

export type Unit = {
    name: string;
    description: string;
}

export const unitsCollection = buildCollection<Unit>({
    name: "Units",
    singularName: "Unit",
    group: "Main",
    id: "units",
    path: "units",
    customId: true,
    icon: "LocalLibrary",
    callbacks: {
        onSaveSuccess: ({ context }) => {
            context.navigation.refreshNavigation();
        },
        onDelete: ({ context }) => {
            context.navigation.refreshNavigation();
        }
    },
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        description: {
            name: "Description",
            validation: { required: true },
            dataType: "string",
            multiline: true
        }
    }
});
