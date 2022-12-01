import {
    AuthController,
    Entity,
    EntityCollection,
    Permissions,
    User
} from "../../types";

const DEFAULT_PERMISSIONS = {
    read: true,
    edit: true,
    create: true,
    delete: true
};

export function resolvePermissions<M extends Record<string, any>, UserType extends User>
(collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 pathSegments: string[],
 entity: Entity<M> | null): Permissions {

    const permission = collection.permissions;
    if (permission === undefined) {
        return DEFAULT_PERMISSIONS;
    } else if (typeof permission === "object") {
        return permission as Permissions;
    } else if (typeof permission === "function") {
        return permission({
            entity,
            user: authController.user,
            authController,
            collection,
            pathSegments
        });
    }
    console.error("Permissions:", permission);
    throw Error("New type of permission added and not mapped");
}

export function canEditEntity<M extends Record<string, any>, UserType extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<UserType>,
    paths: string[],
    entity: Entity<M> | null): boolean {
    return resolvePermissions(collection, authController, paths, entity).edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreateEntity<M extends Record<string, any>, UserType extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<UserType>,
    paths: string[],
    entity: Entity<M> | null): boolean {
    return resolvePermissions(collection, authController, paths, entity).create ?? DEFAULT_PERMISSIONS.create;
}

export function canDeleteEntity<M extends Record<string, any>, UserType extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<UserType>,
    paths: string[],
    entity: Entity<M> | null): boolean {
    return resolvePermissions(collection, authController, paths, entity).delete ?? DEFAULT_PERMISSIONS.delete;
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
