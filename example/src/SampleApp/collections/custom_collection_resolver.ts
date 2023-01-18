import { buildCollection, CollectionOverrideHandler } from "firecms";

/**
 * You can use a custom collection resolver to override configs for specific
 * entities
 * @param entityId
 * @param path
 */
export const customCollectionOverrideHandler: CollectionOverrideHandler = ({
                                                  entityId,
                                                  path
                                              }: {
    entityId?: string;
    path: string;
}) => {

    if (entityId === "B0017TNJWY" && path === "products") {
        return buildCollection({
            path: "custom_product",
            name: "Custom product",
            properties: {
                name: {
                    name: "Name",
                    description: "This entity is using configuration overridden by a collection resolver",
                    validation: { required: true },
                    dataType: "string"
                }
            }
        });
    }
    return undefined;
};
