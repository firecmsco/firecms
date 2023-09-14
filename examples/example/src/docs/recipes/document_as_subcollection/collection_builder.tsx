import { buildCollection, EntityCollectionsBuilder } from "firecms";
import { Unit, unitsCollection } from "./unit_collection";

const collectionBuilder: EntityCollectionsBuilder = async ({ dataSource }) => {
    const units = await dataSource.fetchCollection<Unit>({
        path: "units",
        collection: unitsCollection
    });
    const lessonCollections = units.map(unit => buildCollection({
        name: unit.values.name,
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
