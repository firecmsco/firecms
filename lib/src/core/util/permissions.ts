import {
    AuthController,
    Entity,
    FireCMSContext,
    Permissions,
    EntityPermissionsBuilder
} from "../../models";

const DEFAULT_PERMISSIONS = {
    edit: true,
    create: true,
    delete: true
};

function checkHasPermissionOnEntity<M extends { [Key: string]: any }, UserType>
(permission: EntityPermissionsBuilder<M, UserType> | Permissions | undefined,
 entity: Entity<M> | null,
 authController: AuthController<UserType>,
 path: string,
 context: FireCMSContext<UserType>): Permissions {

    if (permission === undefined) {
        return DEFAULT_PERMISSIONS;
    } else if (typeof permission === "object") {
        return permission as Permissions;
    } else if (typeof permission === "function") {
        return permission({
            user: authController.user,
            authController,
            entity,
            path,
            context
        });
    }

    throw Error("New type of HasPermission added and not mapped");
}

export function canEditEntity<M extends { [Key: string]: any }, UserType>
(permission: EntityPermissionsBuilder<M, UserType> | Permissions | undefined,
 entity: Entity<M>,
 authController: AuthController<UserType>,
 path: string,
 context: FireCMSContext<UserType>): boolean {
    return checkHasPermissionOnEntity(permission, entity, authController, path, context).edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreateEntity<M extends { [Key: string]: any }, UserType>
(permission: EntityPermissionsBuilder<M, UserType> | Permissions | undefined,
 authController: AuthController<UserType>,
 path: string,
 context: FireCMSContext<UserType>): boolean {
    return checkHasPermissionOnEntity(permission, null, authController, path, context).create ?? DEFAULT_PERMISSIONS.create;
}

export function canDeleteEntity<M extends { [Key: string]: any }, UserType>
(permission: EntityPermissionsBuilder<M, UserType> | Permissions | undefined,
 entity: Entity<M>,
 authController: AuthController<UserType>,
 path: string,
 context: FireCMSContext<UserType>): boolean {
    return checkHasPermissionOnEntity(permission, entity, authController, path, context).delete ?? DEFAULT_PERMISSIONS.delete;
}
