import { getColorSchemeForSeed } from "../util/chip_utils";

it("chip colors", () => {

    const chipColorSchema = getColorSchemeForSeed("furniture");
    console.log(chipColorSchema);

    console.log(getColorSchemeForSeed("related_products"));
});
