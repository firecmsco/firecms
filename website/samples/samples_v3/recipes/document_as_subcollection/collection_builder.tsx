import { buildCollection, EntityCollectionsBuilder } from "@firecms/core";
import { Unit, unitsCollection } from "./unit_collection";

const collectionBuilder: EntityCollectionsBuilder = async ({ dataSource }) => {
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
};
