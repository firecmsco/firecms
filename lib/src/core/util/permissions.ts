import {
    AuthController,
    Entity,
    FireCMSContext,
    Permissions,
    PermissionsBuilder
} from "../../models";

const DEFAULT_PERMISSIONS = {
    edit: true,
    create: true,
    delete: true
};

function checkHasPermissionOnEntity<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
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

export function canEdit<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
 entity: Entity<M>,
 authController: AuthController<UserType>,
 path: string,
 context: FireCMSContext<UserType>): boolean {
    return checkHasPermissionOnEntity(permission, entity, authController, path, context).edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreate<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
 authController: AuthController<UserType>,
 path: string,
 context: FireCMSContext<UserType>): boolean {
    return checkHasPermissionOnEntity(permission, null, authController, path, context).create ?? DEFAULT_PERMISSIONS.create;
}

export function canDelete<M extends { [Key: string]: any }, UserType>
(permission: PermissionsBuilder<M, UserType> | Permissions | undefined,
 entity: Entity<M>,
 authController: AuthController<UserType>,
 path: string,
 context: FireCMSContext<UserType>): boolean {
    return checkHasPermissionOnEntity(permission, entity, authController, path, context).delete ?? DEFAULT_PERMISSIONS.delete;
}

