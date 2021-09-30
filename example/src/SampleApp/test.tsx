import {
    buildProperties,
    buildProperty,
    buildSchema,
    EntitySchema
} from "@camberi/firecms";

type User = {
    source:
        {
            type: "facebook",
            facebookId: string
        }
        |
        {
            type: "apple",
            appleId: number
        }
}

export const userSchema: EntitySchema = buildSchema<User>({
    name: "User",
    properties: {
        source: ({ values }) => {
            const properties = buildProperties<any>({
                type: {
                    dataType: "string",
                    config: {
                        enumValues: {
                            "facebook": "FacebookId",
                            "apple": "Apple"
                        }
                    }
                }
            });

            if (values.source) {
                if ((values.source as any).type === "facebook") {
                    properties["facebookId"] = buildProperty({
                        dataType: "string"
                    });
                } else if ((values.source as any).type === "apple") {
                    properties["appleId"] = buildProperty({
                        dataType: "number"
                    });
                }
            }

            return ({
                dataType: "map",
                title: "Source",
                properties: properties
            });
        }
    }
});
