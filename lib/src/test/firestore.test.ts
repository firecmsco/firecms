import { Timestamp } from "firebase/firestore";
import {
    cmsToFirestoreModel,
    firestoreToCMSModel
} from "../firebase_app/hooks/useFirestoreDataSource";

it("cmsToFirestoreModel", () => {
    const inputValues = {
        content:
            [{
                type: 'question',
                id: 'question_1',
                question_type: 'single_choice'
            }],
        main_image: null,
        order: 2,
        title: { en: 'Test pill in english' }
    };
    const result = cmsToFirestoreModel(inputValues, {} as any);
    expect(result).toEqual(inputValues);
});

it("timestamp conversion", () => {
    const timestamp = Timestamp.now();
    const date = timestamp.toDate();
    expect(firestoreToCMSModel({ created_on: timestamp })
    ).toEqual({ created_on: date });
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

