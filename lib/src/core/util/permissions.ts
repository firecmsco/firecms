import {
    AuthController,
    CMSType,
    EntityCollection,
    Permissions,
    User
} from "../../models";

const DEFAULT_PERMISSIONS = {
    read: true,
    edit: true,
    create: true,
    delete: true
};

export function resolvePermissions<M extends object, UserType extends User>
(collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 paths: string[]): Permissions {

    const permission = collection.permissions;
    if (permission === undefined) {
        return DEFAULT_PERMISSIONS;
    } else if (typeof permission === "object") {
        return permission as Permissions;
    } else if (typeof permission === "function") {
        return permission({
            user: authController.user,
            authController,
            collection,
            pathSegments: paths
        });
    }
    console.error("Permissions:", permission);
    throw Error("New type of permission added and not mapped");
}

export function canEditEntity<M extends object, UserType extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<UserType>,
    paths: string[]): boolean {
    return resolvePermissions(collection, authController, paths).edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreateEntity<M extends object, UserType extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<UserType>,
    paths: string[]): boolean {
    return resolvePermissions(collection, authController, paths).create ?? DEFAULT_PERMISSIONS.create;
}

export function canDeleteEntity<M extends object, UserType extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<UserType>,
    paths: string[]): boolean {
    return resolvePermissions(collection, authController, paths).delete ?? DEFAULT_PERMISSIONS.delete;
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
