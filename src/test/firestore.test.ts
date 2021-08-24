import firebase from "firebase/app";
import "firebase/firestore";
import { productSchema } from "./test_site_config";
import { initEntityValues } from "../models/utils";
import { FirestoreDatasource } from "../models/data/firestore_datasource";
import { EntitySchema } from "../models";


it("timestamp conversion", () => {

    const schema: EntitySchema<any> = {
        name: "Test entity",
        properties: {
            created_at: {
                dataType: "timestamp",
                title: "Created at"
            }
        }
    };

    const timestamp = firebase.firestore.Timestamp.now();
    const date = timestamp.toDate();
    expect(FirestoreDatasource.firestoreToCMSModel({ created_at: timestamp }, schema, "any")
    ).toEqual({ created_at: date });
});

it("timestamp array conversion", () => {

    const schema: EntitySchema<any> = {
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

    const timestamp = firebase.firestore.Timestamp.now();
    const date = timestamp.toDate();

    expect(
        FirestoreDatasource.firestoreToCMSModel({ my_array: [{ created_at: timestamp }] }, schema, "any")
    ).toEqual({ myArray: [{ created_at: date }] });

});

it("Initial values", () => {

    const initialisedValues = initEntityValues(productSchema, "test");
    console.log(initialisedValues);
    expect(
        Object.values(initialisedValues).filter((v) => v === undefined)
    ).toHaveLength(0);

});

