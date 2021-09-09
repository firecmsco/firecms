import algoliasearch from "algoliasearch";
import { performAlgoliaTextSearch } from "../firebase_app";

it("Test Algolia search", async () => {

    const client = algoliasearch(
        "Y6FR1MDSVW",
        "f084e6dcc154c04295c8124dbb797ff1");

    await performAlgoliaTextSearch(
        client,
        "users",
        "john").then(console.log);
    console.log("done");
});
