import { buildCollection, EntityCollectionsBuilder } from "@firecms/core";
import { Unit, unitsCollection } from "./unit_collection";

const collectionBuilder: EntityCollectionsBuilder = async ({
                                                               dataSource,
                                                               user
                                                           }) => {
    const units = await dataSource.fetchCollection<Unit>({
        path: "units",
    });
    const lessonCollections = units.map(unit => buildCollection<Unit>({
        name: unit.values.name,
        slug: `units/${unit.id}/lessons`,
        dbPath: `units/${unit.id}/lessons`,
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
