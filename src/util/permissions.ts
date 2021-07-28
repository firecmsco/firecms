import {
    Entity,
    EntitySchema,
    Permissions,
    PermissionsBuilder
} from "../models";
import { AuthController, CMSAppContext } from "../contexts";

const DEFAULT_PERMISSIONS = {
    edit: true,
    create: true,
    delete: true
};

function checkHasPermissionOnEntity<S extends EntitySchema<Key>, Key extends string>
(permission: PermissionsBuilder<S, Key> | Permissions | undefined,
 entity: Entity<S, Key> | null,
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

export function canEdit<S extends EntitySchema<Key>, Key extends string>
(permission: PermissionsBuilder<S, Key> | Permissions | undefined,
 entity: Entity<S, Key>,
 authController: AuthController,
 collectionPath:string,
 context: CMSAppContext): boolean {
    return checkHasPermissionOnEntity(permission,  entity, authController, collectionPath, context).edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreate<S extends EntitySchema<Key>, Key extends string>
(permission: PermissionsBuilder<S, Key> | Permissions | undefined,
 authController: AuthController,
 collectionPath:string,
 context: CMSAppContext): boolean {
    return checkHasPermissionOnEntity(permission,  null, authController, collectionPath, context).create ?? DEFAULT_PERMISSIONS.create;
}

export function canDelete<S extends EntitySchema<Key>, Key extends string>
(permission: PermissionsBuilder<S, Key> | Permissions | undefined,
 entity: Entity<S, Key>,
 authController: AuthController,
 collectionPath:string,
 context: CMSAppContext): boolean {
    return checkHasPermissionOnEntity(permission,  entity, authController, collectionPath, context).delete ?? DEFAULT_PERMISSIONS.delete;
}

