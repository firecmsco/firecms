import { Timestamp } from "firebase/firestore";
import { EntitySchema, ResolvedEntitySchema } from "../models";
import {
    firestoreToCMSModel
} from "../firebase_app/hooks/useFirestoreDataSource";

it("timestamp conversion", () => {
    const timestamp = Timestamp.now();
    const date = timestamp.toDate();
    expect(firestoreToCMSModel({ created_at: timestamp })
    ).toEqual({ created_at: date });
});

it("timestamp array conversion", () => {

    const timestamp = Timestamp.now();
    const date = timestamp.toDate();

    expect(
        firestoreToCMSModel({ my_array: [timestamp] })
    ).toEqual({ my_array: [date] });

});

it("Initial values", () => {

// TODO

});

