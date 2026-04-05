import { iconSynonyms } from "./icon_synonyms";
import { iconKeys } from "@rebasepro/ui";
import Fuse from "fuse.js";


const map = iconKeys
    .map((importName) => {
        const iconSynonym = importName in iconSynonyms ? (iconSynonyms as Record<string, string>)[importName] : "";
        return {
            key: importName,
            synonyms: iconSynonym,
        }
    });
export const iconsSearch = new Fuse(map, {
    isCaseSensitive: false,
    shouldSort: true,
    ignoreLocation: true,
    distance: 0,
    keys: ["key", "synonyms"]
})


