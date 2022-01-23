import { Timestamp } from "firebase/firestore";
import { productSchema } from "../test_site_config";
import { computeProperties, initWithProperties } from "../core/utils";
import { EntitySchema, ResolvedEntitySchema } from "../models";
import { firestoreToCMSModel } from "../firebase_app/hooks/useFirestoreDataSource";


it("timestamp conversion", () => {

    const schema: ResolvedEntitySchema<any> = {
        name: "Test entity",
        properties: {
            created_at: {
                dataType: "timestamp",
                title: "Created at"
            }
        },
        originalSchema: { name: "Test entity", properties: {} }
    };

    const timestamp = Timestamp.now();
    const date = timestamp.toDate();
    expect(firestoreToCMSModel({ created_at: timestamp }, schema, "any")
    ).toEqual({ created_at: date });
});

it("timestamp array conversion", () => {

    const schema: EntitySchema = {
        name: "Test entity",
        properties: {
            my_array: {
                dataType: "array",
                of: {
                    dataType: "timestamp",
                    title: "Created at"
                }
            }
        }
    };

    const timestamp = Timestamp.now();
    const date = timestamp.toDate();

    expect(
        firestoreToCMSModel({ my_array: [timestamp] }, schema as ResolvedEntitySchema<any>, "any")
    ).toEqual({ my_array: [date] });

});

it("Initial values", () => {

    const properties = computeProperties({
        propertiesOrBuilder: productSchema.properties,
        path: "test",
        values: productSchema.defaultValues
    });
    const initialisedValues = initWithProperties(properties, productSchema.defaultValues);
    expect(
        Object.values(initialisedValues).filter((v) => v === undefined)
    ).toHaveLength(0);

});

