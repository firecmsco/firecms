import { AuthController, Entity, EntityCollection, Permissions, User } from "../types";
import { collectionSegmentsFrom, fullPathToCollectionSegments } from "./paths";

const DEFAULT_PERMISSIONS = {
    read: true,
    edit: true,
    create: true,
    delete: true
};

/**
 * `pathSegments` is `path` split at its real segment boundaries. It is forwarded so the
 * collection chain handed to a permissions builder stays correct when an entity id contains
 * "/" — splitting `path` positionally would keep the wrong elements. Optional everywhere:
 * omitted, behaviour is exactly as before.
 */
export function resolvePermissions<M extends Record<string, any>, USER extends User>
(collection: EntityCollection<M>,
 authController: AuthController<USER>,
 path: string,
 entity: Entity<M> | null,
 pathSegments?: string[]): Permissions | undefined {

    const permission = collection.permissions;
    if (permission === undefined) {
        return DEFAULT_PERMISSIONS;
    } else if (typeof permission === "object") {
        return permission as Permissions;
    } else if (typeof permission === "function") {
        const collectionSegments = pathSegments
            ? collectionSegmentsFrom(pathSegments)
            : fullPathToCollectionSegments(path);
        return permission({
            entity,
            path,
            user: authController.user,
            authController,
            collection,
            pathSegments: collectionSegments
        });
    }
    console.error("Permissions:", permission);
    throw Error("New type of permission added and not mapped");
}

export function canEditEntity<M extends Record<string, any>, USER extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<USER>,
    path: string,
    entity: Entity<M> | null,
    pathSegments?: string[]): boolean {
    return resolvePermissions(collection, authController, path, entity, pathSegments)?.edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreateEntity<M extends Record<string, any>, USER extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<USER>,
    path: string,
    entity: Entity<M> | null,
    pathSegments?: string[]): boolean {
    if (collection.collectionGroup) return false;
    return resolvePermissions(collection, authController, path, entity, pathSegments)?.create ?? DEFAULT_PERMISSIONS.create;
}

export function canDeleteEntity<M extends Record<string, any>, USER extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<USER>,
    path: string,
    entity: Entity<M> | null,
    pathSegments?: string[]): boolean {
    return resolvePermissions(collection, authController, path, entity, pathSegments)?.delete ?? DEFAULT_PERMISSIONS.delete;
}

// export function resolveCollectionsPermissions(roles: Role[]): Record<string, Permissions> {
//     const collectionIds = Array.from(new Set(roles.flatMap(role => Object.keys(role.collections))));
//     return collectionIds
//         .map((colId) => {
//             const rolesWithCollection = roles.filter((role) => colId in Object.keys(role.collections));
//             return {
//                 [colId]: rolesWithCollection
//                     .map(role => role.collections[colId])
//                     .reduce((permA, permB) => {
//                         return {
//                             read: permA.read ?? permB.read ?? false,
//                             create: permA.create ?? permB.create ?? false,
//                             edit: permA.edit ?? permB.edit ?? false,
//                             delete: permA.delete ?? permB.delete ?? false
//                         };
//                     })
//             };
//         })
//         .reduce((a, b) => ({ ...a, ...b }), {});
// }
