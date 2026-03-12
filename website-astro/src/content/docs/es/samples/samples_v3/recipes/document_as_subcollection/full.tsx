import { buildCollection } from "@firecms/core";
import { FireCMSAppConfig } from "@firecms/cloud";

type Unit = {
    name: string;
    description: string;
}

const unitsCollection = buildCollection<Unit>({
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



const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async ({ dataSource }) => {
        const units = await dataSource.fetchCollection<Unit>({
            path: "units",
        });
        const lessonCollections = units.map(unit => buildCollection({
            name: unit.values.name,
            id: `units/${unit.id}/lessons`,
            path: `units/${unit.id}/lessons`,
            description: unit.values.description,
            group: "Units",
            properties: {
                name: {
                    name: "Name",
                    dataType: "string"
                }
            }
        }));

        return [
            unitsCollection,
            ...lessonCollections
        ]
    }
}

export default appConfig;
