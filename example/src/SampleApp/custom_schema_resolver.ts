import { buildSchema, SchemaResolver } from "@camberi/firecms";

/**
 * You can use a custom schema resolver to override schemas for specific
 * entities
 * @param entityId
 * @param collectionPath
 */
export const customSchemaResolver: SchemaResolver = ({
                                                  entityId,
                                                  collectionPath
                                              }: {
    entityId?: string;
    collectionPath: string;
}) => {

    if (entityId === "B0017TNJWY" && collectionPath === "products") {
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

        console.log("Used custom schema resolver", collectionPath, entityId);
        return { schema: customProductSchema };
    }
};
