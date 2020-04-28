import { AlgoliaTextSearchDelegate } from "../text_search_delegate";

it("Test Algolia search", async () => {

    const algoliaTextSearchDelegate = new AlgoliaTextSearchDelegate(
        "8I8E9KTKY9",
        "2a82ffb16398ac869f6d8df00905346d",
        "milano_receivers");

    await algoliaTextSearchDelegate.performTextSearch("antonio").then(console.log);
    console.log("done");
});
