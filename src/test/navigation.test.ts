import {
    getCollectionsFromPath,
    getCollectionViewFromPath,
} from "../routes/navigation";
import { siteConfig } from "./test_site_config";
import { EntityCollection } from "../models";

const collectionViews = siteConfig.navigation as EntityCollection[];
it("collection view matches ok", () => {

    const collectionViewFromPath = getCollectionViewFromPath("products", collectionViews);
    expect(
        collectionViewFromPath && collectionViewFromPath.relativePath
    ).toEqual("products");

    const collectionViewFromPath1 = getCollectionViewFromPath("products/pid/locales", collectionViews);
    expect(
        collectionViewFromPath1 && collectionViewFromPath1.relativePath
    ).toEqual("locales");

    const collectionViewFromPath2 = getCollectionViewFromPath("sites/es/products", collectionViews);
    expect(
        collectionViewFromPath2 && collectionViewFromPath2.relativePath
    ).toEqual("sites/es/products");

    const collectionViewFromPath3 = getCollectionViewFromPath("sites/es/products/pid/locales", collectionViews);
    expect(
        collectionViewFromPath3 && collectionViewFromPath3.relativePath
    ).toEqual("locales");

    expect(
        () => getCollectionViewFromPath("products/pid/not_existing", collectionViews)
    ).toThrow(
        "Couldn't find the corresponding collection view for the path: products/pid/not_existing"
    );

    expect(
        () => getCollectionViewFromPath("products/pid", collectionViews)
    ).toThrow(
        "Collection paths must have an odd number of segments: products/pid"
    );

    expect(
        () => getCollectionViewFromPath("products", [])
    ).toThrow(
        "Couldn't find the corresponding collection view for the path: products"
    );
    const collectionViewFromPath10 = getCollectionViewFromPath("products/id/subcollection_inline", collectionViews);
    expect(
        collectionViewFromPath10 && collectionViewFromPath10.relativePath
    ).toEqual("products/id/subcollection_inline");

});
it("build entity collection array", () => {

    const collections = getCollectionsFromPath("products/pid", collectionViews);
    console.log(collections);
    // expect(
    //     collections.map((collection) => collection.relativePath)
    // ).toEqual(["products", "locales"]);
});
