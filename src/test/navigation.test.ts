import { getCollectionViewFromPath } from "../routes/navigation";
import { siteConfig } from "./test_site_config";

it("collection view matches ok", () => {

    expect(
        getCollectionViewFromPath("products", siteConfig.navigation).relativePath
    ).toEqual("products");

    expect(
        getCollectionViewFromPath("products/irrelevant/locales", siteConfig.navigation).relativePath
    ).toEqual("locales");

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
