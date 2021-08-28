import { Entity, Permissions, PermissionsBuilder } from "../models";
import { AuthController, CMSAppContext } from "../contexts";

const DEFAULT_PERMISSIONS = {
    edit: true,
    create: true,
    delete: true
};

function checkHasPermissionOnEntity<M extends { [Key: string]: any }>
(permission: PermissionsBuilder<M> | Permissions | undefined,
 entity: Entity<M> | null,
 authController: AuthController,
 collectionPath:string,
 context: CMSAppContext): Permissions {

    if (permission === undefined) {
        return DEFAULT_PERMISSIONS;
    } else if (typeof permission === "object") {
        return permission as Permissions;
    } else if (typeof permission === "function") {
        return permission({
            user: authController.loggedUser,
            entity,
            authController,
            collectionPath,
            context
        });
    }

    throw Error("New type of HasPermission added and not mapped");
}

export function canEdit<M extends { [Key: string]: any }>
(permission: PermissionsBuilder<M> | Permissions | undefined,
 entity: Entity<M>,
 authController: AuthController,
 collectionPath:string,
 context: CMSAppContext): boolean {
    return checkHasPermissionOnEntity(permission,  entity, authController, collectionPath, context).edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreate<M extends { [Key: string]: any }>
(permission: PermissionsBuilder<M> | Permissions | undefined,
 authController: AuthController,
 collectionPath:string,
 context: CMSAppContext): boolean {
    return checkHasPermissionOnEntity(permission,  null, authController, collectionPath, context).create ?? DEFAULT_PERMISSIONS.create;
}

export function canDelete<M extends { [Key: string]: any }>
(permission: PermissionsBuilder<M> | Permissions | undefined,
 entity: Entity<M>,
 authController: AuthController,
 collectionPath:string,
 context: CMSAppContext): boolean {
    return checkHasPermissionOnEntity(permission,  entity, authController, collectionPath, context).delete ?? DEFAULT_PERMISSIONS.delete;
}

