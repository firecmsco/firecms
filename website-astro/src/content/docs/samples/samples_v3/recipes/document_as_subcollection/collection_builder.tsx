import { buildCollection, type EntityCollectionsBuilder } from "@firecms/core";
import { type Unit, unitsCollection } from "./unit_collection";

const collectionBuilder: EntityCollectionsBuilder = async ({
                                                               dataSource,
                                                               user
                                                           }) => {
    const units = await dataSource.fetchCollection<Unit>({
        path: "units",
    });
    const lessonCollections = units.map(unit => buildCollection<Unit>({
        name: unit.values.name,
        id: `units/${unit.id}/lessons`,
        path: `units/${unit.id}/lessons`,
        description: unit.values.description,
        group: "Units",
        properties: {
            name: {
                name: "Name",
                dataType: "string"
            },
            description: {
                name: "Description",
                dataType: "string"
            }
        }
    }));

    return [
        unitsCollection,
        ...lessonCollections
    ]
};
