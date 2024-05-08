import { iconSynonyms } from "./icon_synonyms";
import { iconKeys } from "@firecms/ui";

// @ts-ignore
import * as JsSearch from "js-search";

export const iconsSearch = new JsSearch.Search("key");
iconsSearch.addIndex("synonyms");

iconsSearch.addDocuments(iconKeys
    .map((importName) => {
        return {
            key: importName,
            // @ts-ignore
            synonyms: iconSynonyms[importName] ?? [],
        }
    }));
