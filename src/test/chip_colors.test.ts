import { getColorSchemeForKey } from "../util/chip_utils";

it("chip colors", () => {

    const chipColorSchema = getColorSchemeForKey("furniture");
    console.log(chipColorSchema);

    console.log(getColorSchemeForKey("related_products"));
});
