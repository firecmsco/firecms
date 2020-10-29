import { EntityCollectionView } from "../models";

const DATA_PATH = `/c`;

export interface BreadcrumbEntry {
    title: string;
    url: string;
    view: EntityCollectionView<any>;
}

export function getEntityPath(entityId: string, basePath: string) {
    return `${DATA_PATH}/${removeInitialSlash(basePath)}/${entityId}`;
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
