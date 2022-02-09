import {ValuesCountEntry} from "./models";
import * as admin from "firebase-admin";

export function unslugify(slug: string): string {
    if (slug.includes("-") || slug.includes("_")) {
        const result = slug.replace(/[-_]/g, " ");
        return result.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1);
        });
    } else {
        const unCamelCased = slug.replace(/([A-Z])/g, " $1");
        return unCamelCased.charAt(0).toUpperCase() + unCamelCased.slice(1);
    }

}

export function findCommonInitialStringInPath(valuesCount?: ValuesCountEntry) {

    if (!valuesCount) return undefined;

    function getPath(value: any) {
        if (typeof value === "string") return value;
        else if (value instanceof admin.firestore.DocumentReference) return value.path;
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