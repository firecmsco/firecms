import { describe, expect, it } from "@jest/globals";

import { encodeFilterAndSort, parseFilterAndSort } from "../src/components/common/table_url_params";

/**
 * `encodeFilterAndSort` and `parseFilterAndSort` must stay exact inverses of each other.
 * The `search` param used to be written by `useUpdateUrl` but never read back, which made it
 * disappear on reload. See https://github.com/firecmsco/firecms/issues/724
 */
describe("table url params: search term", () => {

    it("encodes the search term", () => {
        expect(encodeFilterAndSort(undefined, undefined, "inimitable")).toEqual("search=inimitable");
    });

    it("omits the search term when there is none", () => {
        expect(encodeFilterAndSort(undefined, undefined, undefined)).toEqual("");
        expect(encodeFilterAndSort(undefined, undefined, "")).toEqual("");
    });

    it("parses the search term", () => {
        expect(parseFilterAndSort("?search=inimitable").searchString).toEqual("inimitable");
    });

    it("parses the search term written by previous versions with a stray ampersand", () => {
        // `useUpdateUrl` used to concatenate "&search=..." to a possibly empty query string
        expect(parseFilterAndSort("?&search=inimitable").searchString).toEqual("inimitable");
    });

    it("treats a missing or empty search term as undefined", () => {
        expect(parseFilterAndSort("").searchString).toBeUndefined();
        expect(parseFilterAndSort("?__sort=name&__sort_order=asc").searchString).toBeUndefined();
        expect(parseFilterAndSort("?search=").searchString).toBeUndefined();
    });

    it("round-trips search terms with characters that need escaping", () => {
        const terms = [
            "inimitable",
            "the great gatsby",
            "100% pure",
            "a&b",
            "a+b",
            "a=b",
            "café",
            "#hash",
            "a/b?c",
            "\"quoted\""
        ];
        terms.forEach((term) => {
            const encoded = encodeFilterAndSort(undefined, undefined, term);
            expect(parseFilterAndSort(`?${encoded}`).searchString).toEqual(term);
        });
    });

    it("round-trips the search term together with sort and filters", () => {
        const filterValues = { name: ["==", "Dune"] } as const;
        const sortBy: [string, "asc" | "desc"] = ["name", "desc"];

        const encoded = encodeFilterAndSort(filterValues as any, sortBy, "inimitable");
        const parsed = parseFilterAndSort(`?${encoded}`);

        expect(parsed.searchString).toEqual("inimitable");
        expect(parsed.sortBy).toEqual(["name", "desc"]);
        expect(parsed.filterValues).toEqual({ name: ["==", "Dune"] });
    });

    it("does not confuse the search term with a property called `search`", () => {
        const encoded = encodeFilterAndSort({ search: ["==", "engine"] } as any, undefined, "inimitable");
        const parsed = parseFilterAndSort(`?${encoded}`);

        expect(parsed.searchString).toEqual("inimitable");
        expect(parsed.filterValues).toEqual({ search: ["==", "engine"] });
    });

    it("keeps sort and filters untouched when there is no search term", () => {
        const encoded = encodeFilterAndSort({ archived: ["==", false] } as any, ["name", "asc"], undefined);
        const parsed = parseFilterAndSort(`?${encoded}`);

        expect(encoded).not.toContain("search");
        expect(parsed.sortBy).toEqual(["name", "asc"]);
        expect(parsed.filterValues).toEqual({ archived: ["==", false] });
        expect(parsed.searchString).toBeUndefined();
    });

});
