import { iconSynonyms } from "./icon_synonyms";
import { iconKeys } from "@firecms/ui";
import Fuse from "fuse.js";


const map = iconKeys
    .map((importName) => {
        // @ts-ignore
        const iconSynonym = importName in iconSynonyms ? iconSynonyms[importName] : "";
        return {
            key: importName,
            synonyms: iconSynonym,
        }
    });
export const iconsSearch = new Fuse(map, {
    isCaseSensitive: false,
    shouldSort: true,
    distance: 0,
    keys: ["key", "synonyms"]
})


