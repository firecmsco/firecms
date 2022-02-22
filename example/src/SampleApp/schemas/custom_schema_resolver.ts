import { buildSchema, SchemaOverrideHandler } from "@camberi/firecms";

/**
 * You can use a custom schema resolver to override schemas for specific
 * entities
 * @param entityId
 * @param path
 */
export const customSchemaOverrideHandler: SchemaOverrideHandler = ({
                                                  entityId,
                                                  path
                                              }: {
    entityId?: string;
    path: string;
}) => {

    if (entityId === "B0017TNJWY" && path === "products") {
        const customProductSchema = buildSchema({
            name: "Custom product",
            properties: {
                name: {
                    title: "Name",
                    description: "This entity is using a schema overridden by a schema resolver",
                    validation: { required: true },
                    dataType: "string"
                }
            }
        });

        console.log("Used custom schema resolver", path, entityId);
        return { schema: customProductSchema };
    }
    return undefined;
};
