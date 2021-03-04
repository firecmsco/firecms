import {
    getCollectionViewFromPath,
    getCollectionViewsFromPath
} from "../routes/navigation";
import { siteConfig } from "./test_site_config";
import { knowledgeSiteConfig } from "./knowledge_config";

it("collection view matches ok", () => {

    // const collectionViewFromPath = getCollectionViewFromPath("products", siteConfig.navigation);
    // expect(
    //     collectionViewFromPath && collectionViewFromPath.relativePath
    // ).toEqual("products");
    //
    // const collectionViewFromPath1 = getCollectionViewFromPath("products/pid/locales", siteConfig.navigation);
    // expect(
    //     collectionViewFromPath1 && collectionViewFromPath1.relativePath
    // ).toEqual("locales");
    //
    // const collectionViewFromPath2 = getCollectionViewFromPath("sites/es/products", siteConfig.navigation);
    // expect(
    //     collectionViewFromPath2 && collectionViewFromPath2.relativePath
    // ).toEqual("sites/es/products");
    //
    // const collectionViewFromPath3 = getCollectionViewFromPath("sites/es/products/pid/locales", siteConfig.navigation);
    // expect(
    //     collectionViewFromPath3 && collectionViewFromPath3.relativePath
    // ).toEqual("locales");
    //
    // expect(
    //     () => getCollectionViewFromPath("products/pid/not_existing", siteConfig.navigation)
    // ).toThrow(
    //     "Couldn't find the corresponding collection view for the path: products/pid/not_existing"
    // );
    //
    // expect(
    //     () => getCollectionViewFromPath("products/pid", siteConfig.navigation)
    // ).toThrow(
    //     "Collection paths must have an odd number of segments: products/pid"
    // );
    //
    // expect(
    //     () => getCollectionViewFromPath("products", [])
    // ).toThrow(
    //     "Couldn't find the corresponding collection view for the path: products"
    // );
    // const collectionViewFromPath10 = getCollectionViewFromPath("products/id/subcollection_inline", siteConfig.navigation);
    // expect(
    //     collectionViewFromPath10 && collectionViewFromPath10.relativePath
    // ).toEqual("products/id/subcollection_inline");

    const collectionViewFromPath10 = getCollectionViewFromPath("BodyModels/AppBodyPlain/AppBodyPlain", knowledgeSiteConfig.navigation);
    expect(
        collectionViewFromPath10 && collectionViewFromPath10.relativePath
    ).toEqual("BodyModels/AppBodyPlain/AppBodyPlain");

});
it("build entity collection array", () => {

    const collections = getCollectionViewsFromPath("products/pid", siteConfig.navigation);
    console.log(collections);
    // expect(
    //     collections.map((collection) => collection.relativePath)
    // ).toEqual(["products", "locales"]);
});
