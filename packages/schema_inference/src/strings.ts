import { ValuesCountEntry } from "./types";
import { DocumentReference } from "firebase/firestore";


export function findCommonInitialStringInPath(valuesCount?: ValuesCountEntry) {

    if (!valuesCount) return undefined;

    function getPath(value: any) {
        if (typeof value === "string") return value;
        else if (value instanceof DocumentReference) return value.path;
        else return undefined;
    }

    const strings: string[] = valuesCount.values.map((v) => getPath(v)).filter(v => !!v) as string[];
    const pathWithSlash = strings.find((s) => s.includes("/"));
    if (!pathWithSlash)
        return undefined;

    const searchedPath = pathWithSlash.substr(0, pathWithSlash.lastIndexOf("/"));

    const yep = valuesCount.values
        .filter((value) => {
            const path = getPath(value);
            if (!path) return false;
            return path.startsWith(searchedPath)
        }).length > valuesCount.values.length / 3 * 2;

    return yep ? searchedPath : undefined;

}

export function removeInitialAndTrailingSlashes(s: string): string {
    return removeInitialSlash(removeTrailingSlash(s));
}

export function removeInitialSlash(s: string) {
    if (s.startsWith("/"))
        return s.slice(1);
    else return s;
}

export function removeTrailingSlash(s: string) {
    if (s.endsWith("/"))
        return s.slice(0, -1);
    else return s;
}
