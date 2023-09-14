import { removeFunctions } from "../core/util/objects";

const obj = {
    id: "022QFOrveCab2YUT88iw",
    first_name: () => "Jesus",
    location: {
        postcode: 99785,
        country: "Ireland",
        city: () => "Kinsale",
        coordinates: {
            latitude: () => "60.0671",
            longitude: "107.5433"
        }
    }
};

it("Test remove functions in object", () => {
    expect(removeFunctions(obj)).toEqual(
        {
            id: "022QFOrveCab2YUT88iw",
            location: {
                postcode: 99785,
                country: "Ireland",
                coordinates: {
                    longitude: "107.5433"
                }
            }
        }
    );
});

const obj2 = {
    id: "022QFOrveCab2YUT88iw",
    first_name: () => "Jesus",
    location: {
        postcode: ["23423"]
    }
};

it("Test remove functions in object", () => {
    expect(removeFunctions(obj2)).toEqual(
        {
            id: "022QFOrveCab2YUT88iw",
            location: {
                postcode: ["23423"]
            }
        });
});
