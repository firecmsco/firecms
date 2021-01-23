import firebase from "firebase/app";
import {
    initEntityValues,
    replaceTimestampsWithDates
} from "../models/firestore";
import { productSchema } from "./test_site_config";


it("timestamp conversion", () => {

    const timestamp = firebase.firestore.Timestamp.now();
    const date = timestamp.toDate();
    expect(
        replaceTimestampsWithDates({ created_at: timestamp })
    ).toEqual({ created_at: date });
});

it("timestamp array conversion", () => {

    const timestamp = firebase.firestore.Timestamp.now();
    const date = timestamp.toDate();

    expect(
        replaceTimestampsWithDates({ o: [{ created_at: timestamp }] })
    ).toEqual({ o: [{ created_at: date }] });

});

it("Initial values", () => {

    const initialisedValues = initEntityValues(productSchema);
    console.log(initialisedValues);
    expect(
        Object.values(initialisedValues).filter((v) => v === undefined)
    ).toHaveLength(0);

});

