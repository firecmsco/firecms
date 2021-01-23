import { AlgoliaTextSearchDelegate } from "../models/text_search_delegate";
import algoliasearch from "algoliasearch";

it("Test Algolia search", async () => {

    const client = algoliasearch(
        "Y6FR1MDSVW",
        "f084e6dcc154c04295c8124dbb797ff1");

    const algoliaTextSearchDelegate = new AlgoliaTextSearchDelegate(
        client,
        "users");

    await algoliaTextSearchDelegate.performTextSearch("john").then(console.log);
    console.log("done");
});
