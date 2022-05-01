import {
    AuthController,
    EntityCollection,
    Permissions,
    Role,
    User
} from "../../models";
import { segmentsToStrippedPath } from "./paths";

const DEFAULT_PERMISSIONS = {
    read: true,
    edit: true,
    create: true,
    delete: true
};

export function resolvePermissions<M extends { [Key: string]: any }, UserType extends User>
(collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 paths: string[]): Permissions {

    const permission = collection.permissions;
    if (permission === undefined) {
        if (!authController.roles) {
            return DEFAULT_PERMISSIONS;
        } else {
            const strippedCollectionPath = segmentsToStrippedPath(paths);
            return resolveCollectionPermissions(authController.roles, strippedCollectionPath);
        }
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

    throw Error("New type of permission added and not mapped");
}

export function canEditEntity<M extends { [Key: string]: any }, UserType extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<UserType>,
    paths: string[]): boolean {
    return resolvePermissions(collection, authController, paths).edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreateEntity<M extends { [Key: string]: any }, UserType extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<UserType>,
    paths: string[]): boolean {
    return resolvePermissions(collection, authController, paths).create ?? DEFAULT_PERMISSIONS.create;
}

export function canDeleteEntity<M extends { [Key: string]: any }, UserType extends User>
(
    collection: EntityCollection<M>,
    authController: AuthController<UserType>,
    paths: string[]): boolean {
    return resolvePermissions(collection, authController, paths).delete ?? DEFAULT_PERMISSIONS.delete;
}

const mergePermissions = (permA: Permissions, permB: Permissions) => {
    return {
        read: permA.read ?? permB.read,
        create: permA.create ?? permB.create,
        edit: permA.edit ?? permB.edit,
        delete: permA.delete ?? permB.delete
    };
}

export function resolveCollectionPermissions(roles: Role[], path: string): Permissions {
    const basePermissions = {
        read: false,
        create: false,
        edit: false,
        delete: false
    };
    return roles
        .map(role => resolveCollectionRole(role, path))
        .reduce(mergePermissions, basePermissions);
}

function resolveCollectionRole(role: Role, path: string): Permissions {

    const basePermissions = {
        read: role.isAdmin,
        create: role.isAdmin,
        edit: role.isAdmin,
        delete: role.isAdmin
    };
    if (role.collectionPermissions && role.collectionPermissions[path]) {
        return mergePermissions(role.collectionPermissions[path], basePermissions);
    } else if (role.defaultPermissions) {
        return mergePermissions(role.defaultPermissions, basePermissions);
    } else {
        return basePermissions;
    }
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
