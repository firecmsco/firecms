import { AlgoliaTextSearchDelegate } from "../text_search_delegate";
import algoliasearch from "algoliasearch";

it("Test Algolia search", async () => {

    const client = algoliasearch("8I8E9KTKY9",
        "2a82ffb16398ac869f6d8df00905346d");

    const algoliaTextSearchDelegate = new AlgoliaTextSearchDelegate(
        client,
        "milano_receivers");

    await algoliaTextSearchDelegate.performTextSearch("antonio").then(console.log);
    console.log("done");
});
