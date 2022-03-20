import { getCollectionByPath } from "../core/util/navigation_utils";
import { siteConfig } from "./test_site_config";
import { EntityCollection, Navigation } from "../models";
import { getNavigationEntriesFromPathInternal } from "../core/util/navigation_from_path";


const collections = (siteConfig.navigation as Navigation).collections as EntityCollection[];

const findSchema = (path: string): EntityCollection => {
    if(!collections) throw Error();
    const collection = collections.find((s) => s.path === path);
    if (!collection)
        throw Error("Not able to find collection with id: " + path);
    return collection;
};

it("collection view matches ok", () => {

    const collectionViewFromPath = getCollectionByPath("products", collections);
    expect(
        collectionViewFromPath && collectionViewFromPath.path
    ).toEqual("products");

    const collectionViewFromPath1 = getCollectionByPath("products/pid/locales", collections);
    expect(
        collectionViewFromPath1 && collectionViewFromPath1.path
    ).toEqual("locales");

    const collectionViewFromPath2 = getCollectionByPath("sites/es/products", collections);
    expect(
        collectionViewFromPath2 && collectionViewFromPath2.path
    ).toEqual("sites/es/products");

    const collectionViewFromPath3 = getCollectionByPath("sites/es/products/pid/locales", collections);
    expect(
        collectionViewFromPath3 && collectionViewFromPath3.path
    ).toEqual("locales");

    expect(
        () => getCollectionByPath("products/pid", collections)
    ).toThrow(
        "Collection paths must have an odd number of segments: products/pid"
    );

    expect(
        getCollectionByPath("products", [])
    ).toEqual(undefined);

    const collectionViewFromPath10 = getCollectionByPath("products/id/subcollection_inline", collections);
    expect(
        collectionViewFromPath10 && collectionViewFromPath10.path
    ).toEqual("products/id/subcollection_inline");

});

it("build entity collection array", () => {

    const navigationEntries = getNavigationEntriesFromPathInternal({
        path: "products/pid",
        collections: collections,
    });
    console.log(navigationEntries);
    // expect(
    //     navigationEntries.map((collection) => collection.relativePath)
    // ).toEqual(["products", "locales"]);
});


it("Custom view internal", () => {

    const navigationEntries = getNavigationEntriesFromPathInternal({
        path: "products/pid/custom_view",
        collections: collections,
    });
    console.log(navigationEntries);
    expect(navigationEntries.length).toEqual(3);
});

it("build entity collection array 2", () => {

    const navigationEntries = getNavigationEntriesFromPathInternal({
        path: "products/pid/locales/yep",
        collections: collections,
    });
    console.log(navigationEntries);
    expect(navigationEntries.length).toEqual(4);
});
