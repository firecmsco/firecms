import { getAllPaths, PathConfiguration } from "../routes";
import { siteConfig } from "./test_site_config";
import { getColorSchemeForKey } from "../util/chip_utils";

it("chip colors", () => {

    const chipColorSchema = getColorSchemeForKey("furniture");
    console.log(chipColorSchema);
});
