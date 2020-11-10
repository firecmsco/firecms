import { EntityCollectionView } from "../models";

const DATA_PATH = `/c`;

export interface BreadcrumbEntry {
    title: string;
    url: string;
    view: EntityCollectionView;
}

export function getEntityPath(entityId: string, basePath: string) {
    return `${DATA_PATH}/${removeInitialSlash(basePath)}/${entityId}`;
}

export function getEntityPathFrom(fullPath: string) {
    return `${DATA_PATH}/${fullPath}`;
}

export function getRouterNewEntityPath(basePath: string) {
    return `${DATA_PATH}/${removeInitialSlash(basePath)}/new`;
}

export function buildCollectionPath(absolutePath: string) {
    return `${DATA_PATH}/${removeInitialSlash(absolutePath)}`;
}

export function removeInitialSlash(s: string) {
    if (s.startsWith("/"))
        return s.slice(1);
    else return s;
}

export function addInitialSlash(s: string) {
    if (s.startsWith("/"))
        return s;
    else return `/${s}`;
}

export function getCollectionPathFrom(s: string) {
    return s.substr(0, s.lastIndexOf("/"));
}

export function getCollectionViewFromPath(path: string, collectionViews: EntityCollectionView<any>[]): EntityCollectionView<any> {
    const subpaths = removeInitialSlash(path).split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`Collection paths must have an odd number of segments: ${path}`);
    }
    const firstPath = subpaths[0];
    if (firstPath) {
        const navigationEntry = collectionViews && collectionViews.find((entry) => entry.relativePath === firstPath);
        if (!navigationEntry) {
            throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
        }
        if (subpaths.length > 1) {
            if (!navigationEntry.subcollections) {
                throw Error(`Provided path is longer than the navigation collections configuration: ${path}`);
            }
            return getCollectionViewFromPath(subpaths.splice(2).join("/"), navigationEntry.subcollections);
        } else {
            return navigationEntry;
        }
    } else {
        throw Error(`Provided path is shorter than the navigation collections configuration: ${path}`);
    }
}
