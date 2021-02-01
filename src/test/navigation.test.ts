import {
    getCollectionViewFromPath,
    getCollectionViewsFromPath
} from "../routes/navigation";
import { siteConfig } from "./test_site_config";

it("collection view matches ok", () => {

    expect(
        getCollectionViewFromPath("products", siteConfig.navigation).relativePath
    ).toEqual("products");

    expect(
        getCollectionViewFromPath("products/pid/locales", siteConfig.navigation).relativePath
    ).toEqual("locales");

    expect(
        getCollectionViewFromPath("sites/es/products", siteConfig.navigation).relativePath
    ).toEqual("sites/es/products");

    expect(
        getCollectionViewFromPath("sites/es/products/pid/locales", siteConfig.navigation).relativePath
    ).toEqual("locales");

    expect(
        () => getCollectionViewFromPath("products/pid/not_existing", siteConfig.navigation)
    ).toThrow(
        "Couldn't find the corresponding collection view for the path: products/pid/not_existing"
    );

    expect(
        () => getCollectionViewFromPath("products/pid", siteConfig.navigation)
    ).toThrow(
        "Collection paths must have an odd number of segments: products/pid"
    );

    expect(
        () => getCollectionViewFromPath("products", [])
    ).toThrow(
        "Couldn't find the corresponding collection view for the path: products"
    );
});
it("build entity collection array", () => {

    const collections = getCollectionViewsFromPath("products/pid", siteConfig.navigation);
    console.log(collections);
    // expect(
    //     collections.map((collection) => collection.relativePath)
    // ).toEqual(["products", "locales"]);
});
