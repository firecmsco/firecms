// This file contains a minimum example based on current code
// to see that the type checking in our schemas does not work
interface EntitySchema<Key extends string = string, T extends any = any> {
    properties: Record<Key, Property<T>>;
}

type Property<T = any> =
    T extends string ? StringProperty :
        T extends number ? NumberProperty : never;


interface StringProperty {
    dataType: "string";
}

interface NumberProperty {
    dataType: "number";
}

function buildSchemaFrom<Type extends Partial<{ [P in Key]: T; }>,
    Key extends string = Extract<keyof Type, string>,
    T = any>(
    schema: EntitySchema<Key>
): EntitySchema<Key> {
    return schema;
}

type Product = {
    name: string,
    price: number,
}

export const productSchema = buildSchemaFrom<Product>({
    properties: {
        name: {
            dataType: "string"
        },
        price: {
            dataType: "string", // THIS SHOULD FAIL
        },
        // missing: { // This fails if uncommented, which is expected
        //     dataType: "string",
        // },
    }
});
