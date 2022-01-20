import { getValueInPath } from "../core/util/objects";

const obj = {
    id: "022QFOrveCab2YUT88iw",
    first_name: "Jesus",
    location: {
        postcode: 99785,
        country: "Ireland",
        city: "Kinsale",
        coordinates: {
            latitude: "60.0671",
            longitude: "107.5433"
        },
        street: {
            number: 3570,
            name: "Albert Road"
        },
        state: "Sligo",
        timezone: {
            offset: "+4:00",
            description: "Abu Dhabi, Muscat, Baku, Tbilisi"
        }
    },
    gender: "male",
    picture: {
        medium: "https://randomuser.me/api/portraits/med/men/17.jpg",
        thumbnail: "https://randomuser.me/api/portraits/thumb/men/17.jpg",
        large: "https://randomuser.me/api/portraits/men/17.jpg"
    },
    liked_products: [
        "products/B079J9XP7N"
    ],
    phone: "071-814-6255",
    last_name: "Riley",
    email: "jesus.riley@example.com"
};

it("Test path access in object", () => {
    expect(getValueInPath(obj, "email")).toEqual("jesus.riley@example.com");
    expect(getValueInPath(obj, "picture.medium")).toEqual("https://randomuser.me/api/portraits/med/men/17.jpg");
    expect(getValueInPath(obj, "location.timezone.offset")).toEqual("+4:00");
    expect(getValueInPath(obj, "location.street.number")).toEqual(3570);
    expect(getValueInPath(obj, "location.street.nope")).toEqual(undefined);
    expect(getValueInPath(obj, "nope")).toEqual(undefined);
    expect(getValueInPath(obj, "nope.nope")).toEqual(undefined);
    expect(getValueInPath(obj, "nope.nope.nope.nope")).toEqual(undefined);
});
