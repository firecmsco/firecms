import {
    AuthController,
    EntityCollection,
    Permissions,
    PermissionsBuilder
} from "../../models";

const DEFAULT_PERMISSIONS = {
    edit: true,
    create: true,
    delete: true,
    editCollection: true,
    deleteCollection: true
};

export function resolvePermissions<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
 collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 paths: string[]): Permissions {

    if (permission === undefined) {
        return DEFAULT_PERMISSIONS;
    } else if (typeof permission === "object") {
        return permission as Permissions;
    } else if (typeof permission === "function") {
        return permission({
            user: authController.user,
            authController,
            collection,
            paths
        });
    }

    throw Error("New type of permission added and not mapped");
}

export function canEditEntity<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
 collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 paths: string[]): boolean {
    return resolvePermissions(permission, collection, authController, paths).edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreateEntity<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
 collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 paths: string[]): boolean {
    return resolvePermissions(permission, collection, authController, paths).create ?? DEFAULT_PERMISSIONS.create;
}

export function canDeleteEntity<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
 collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 paths: string[]): boolean {
    return resolvePermissions(permission, collection, authController, paths).delete ?? DEFAULT_PERMISSIONS.delete;
}

export function canEditCollection<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
 collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 paths: string[]): boolean {
    return resolvePermissions(permission, collection, authController, paths).editCollection ?? DEFAULT_PERMISSIONS.editCollection;
}

export function canDeleteCollection<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
 collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 paths: string[]): boolean {
    return resolvePermissions(permission, collection, authController, paths).deleteCollection ?? DEFAULT_PERMISSIONS.deleteCollection;
}
