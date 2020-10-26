import { Entity, EntityCollectionView } from "../models";
import hash from "object-hash";

const DATA_PATH = `/c`;

export type RouteType = "entity" | "collection";

export interface PathConfiguration {
    entityPlaceholderPath: string; // path with placeholders instead of ids
    view: EntityCollectionView<any>;
    entries: {
        routeType: RouteType;
        placeHolderId: string;
        fullPath: string;
    }[];
    breadcrumbs: BreadcrumbEntry[];
}

export interface BreadcrumbEntry {
    relativePlaceholderPath: string; // path with placeholders instead of ids
    view: EntityCollectionView<any>;
    placeHolderId?: string;
}

/**
 * Generate all navigation paths related to a list of entity views
 * @param entityCollectionView
 * @param basePath
 * @param previousBreadcrumbs
 */
export function getNavigationPaths(entityCollectionView: EntityCollectionView<any>[],
                                   basePath: string = "",
                                   previousBreadcrumbs: BreadcrumbEntry[] = []): PathConfiguration[] {

    const pathConfigurations: PathConfiguration[] = [];
    entityCollectionView.forEach((view) => {

        const viewPath = removeInitialSlash(view.relativePath);
        const path = removeInitialSlash(`${basePath}/${viewPath}`);
        const placeHolderId = getPlaceHolderIdForView(path || "", view);
        const entityPath = `${path}/:${placeHolderId}`;
        const entityPathNew = `${path}/new`;

        const breadcrumbs = [
            ...previousBreadcrumbs,
            {
                relativePlaceholderPath: path,
                view
            },
            {
                relativePlaceholderPath: entityPath,
                placeHolderId,
                view
            }
            ];

        const pathConfiguration: PathConfiguration = {
            entries: [
                {
                    routeType: "entity",
                    placeHolderId,
                    fullPath: entityPathNew
                },
                {
                    routeType: "entity",
                    placeHolderId,
                    fullPath: entityPath
                },
                {
                    routeType: "collection",
                    placeHolderId,
                    fullPath: path
                }
            ],
            breadcrumbs: breadcrumbs,
            entityPlaceholderPath: path,
            view
        };

        // The order in which this routes are added matters
        if (view.subcollections) {
            getNavigationPaths(view.subcollections, entityPath, breadcrumbs)
                .forEach((pathConfiguration) => pathConfigurations.push(pathConfiguration));
        }
        pathConfigurations.push(pathConfiguration);
    });
    return pathConfigurations;
}

export function replacePathIdentifiers(params: Record<string, string>, basePath: string) {
    let replacedPath = basePath;
    Object.entries(params).forEach(([key, value]) => replacedPath = replacedPath.replace(`:${key}`, value));
    return replacedPath;
}

export function getPlaceHolderIdForView(basePath: string, view: EntityCollectionView<any>): string {
    return hash({ basePath, ...view }).slice(0, 10);
}

export function getEntityPath(entityId: string, basePath: string) {
    return `${DATA_PATH}/${basePath}/${entityId}`;
}

export function getRouterNewEntityPath(basePath: string) {
    return `${DATA_PATH}/${basePath}/new`;
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

export function getCollectionEditPath(entity:Entity<any>){
    const fbPath = entity.reference.path;
    return `${DATA_PATH}/${fbPath}`;
}
