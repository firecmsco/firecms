import {
    getCollectionByPathOrAlias,
    resolveCollectionPathAliases
} from "../core/util/navigation_utils";
import { siteConfig } from "./test_site_config";
import {
    getNavigationEntriesFromPathInternal
} from "../core/util/navigation_from_path";
import { EntityCollection } from "../types";

const collections = siteConfig.collections as EntityCollection[];

it("collection view matches ok", () => {

    const collectionViewFromPath = getCollectionByPathOrAlias("products", collections);
    expect(
        collectionViewFromPath && collectionViewFromPath.path
    ).toEqual("products");

    const collectionViewFromPath1 = getCollectionByPathOrAlias("products/pid/locales", collections);
    expect(
        collectionViewFromPath1 && collectionViewFromPath1.path
    ).toEqual("locales");

    const collectionViewFromPath2 = getCollectionByPathOrAlias("sites/es/products", collections);
    expect(
        collectionViewFromPath2 && collectionViewFromPath2.path
    ).toEqual("sites/es/products");

    const collectionViewFromPath3 = getCollectionByPathOrAlias("sites/es/products/pid/locales", collections);
    expect(
        collectionViewFromPath3 && collectionViewFromPath3.path
    ).toEqual("locales");

    expect(
        () => getCollectionByPathOrAlias("products/pid", collections)
    ).toThrow(
        "Collection paths must have an odd number of segments: products/pid"
    );

    expect(
        getCollectionByPathOrAlias("products", [])
    ).toEqual(undefined);

    const collectionViewFromPath10 = getCollectionByPathOrAlias("products/id/subcollection_inline", collections);
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

it("Test aliases", () => {

    const resolvedPath = resolveCollectionPathAliases("u", collections);
    expect(resolvedPath).toEqual("users");

    const resolvedPath2 = resolveCollectionPathAliases("u/123/products", collections);
    expect(resolvedPath2).toEqual("users/123/products");

    const resolvedPath3 = resolveCollectionPathAliases("u/123/p", collections);
    expect(resolvedPath3).toEqual("users/123/products");

    const resolvedPath4 = resolveCollectionPathAliases("users/123/p", collections);
    expect(resolvedPath4).toEqual("users/123/products");

    const resolvedPath5 = resolveCollectionPathAliases("products/id/subcollection_inline", collections);
    expect(resolvedPath5).toEqual("products/id/subcollection_inline");
});
