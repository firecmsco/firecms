import { getColorSchemeForSeed } from "../src/core/util/chip_utils";
import { describe, expect, test } from "@jest/globals";

describe("chip colors", () => {

    test("ok", () => {

        const chipColorSchema = getColorSchemeForSeed("furniture");
        console.log(chipColorSchema);

        console.log(getColorSchemeForSeed("related_products"));
    })

});
