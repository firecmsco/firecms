import { getCollectionViewFromPath } from "../routes/navigation";
import {
    localeCollection,
    productsCollection,
    siteConfig
} from "./test_site_config";

it("collection view matches ok", () => {

    expect(
        getCollectionViewFromPath("products", siteConfig.navigation)
    ).toEqual(productsCollection);

    expect(
        getCollectionViewFromPath("products/irrelevant/locales", siteConfig.navigation)
    ).toEqual(localeCollection);

    expect(
        () => getCollectionViewFromPath("products/irrelevant/not_existing", siteConfig.navigation)
    ).toThrow(
        "Couldn't find the corresponding collection view for the path: not_existing"
    );

    expect(
        () => getCollectionViewFromPath("products/irrelevant", siteConfig.navigation)
    ).toThrow(
        "Collection paths must have an odd number of segments: products/irrelevant"
    );

    expect(
        () => getCollectionViewFromPath("products", [])
    ).toThrow(
        "Couldn't find the corresponding collection view for the path: products"
    );
});
