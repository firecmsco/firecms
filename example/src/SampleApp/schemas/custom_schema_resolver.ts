import { buildCollection, CollectionOverrideHandler } from "@camberi/firecms";

/**
 * You can use a custom schema resolver to override schemas for specific
 * entities
 * @param entityId
 * @param path
 */
export const customSchemaOverrideHandler: CollectionOverrideHandler = ({
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
                    description: "This entity is using a schema overridden by a schema resolver",
                    validation: { required: true },
                    dataType: "string"
                }
            }
        });
    }
    return undefined;
};
