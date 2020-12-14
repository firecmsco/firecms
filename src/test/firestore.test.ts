import firebase from "firebase/app";
import { replaceTimestampsWithDates } from "../firebase/firestore";


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

