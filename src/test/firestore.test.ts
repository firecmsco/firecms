import { updateAutoValues } from "../firebase/firestore";
import { buildProperties, EntityStatus } from "../models";

const properties = buildProperties({
    title:{
        dataType: "string"
    },
    conditions: {
        dataType: "array",
        of: {
            dataType: "map",
            properties: {
                type: { dataType: "string" },
                values: {
                    dataType: "array",
                    of: {
                        dataType: "string"
                    }
                }
            }
        }
    }
});

it("autovalues complex update", () => {

    const inputValues = {
        conditions: [
            { type: "ids", values: ["yes", "no"] }
        ]
    };

    expect(
        updateAutoValues(inputValues, properties, EntityStatus.existing)
    ).toEqual(inputValues);

});

it("autovalues preserve values not in properties", () => {

    const inputValues = {
        newProperty: "!",
        conditions: [
            { type: "ids", values: ["yes", "no"] }
        ]
    };

    expect(
        updateAutoValues(inputValues, properties, EntityStatus.existing)
    ).toEqual(inputValues);

});
