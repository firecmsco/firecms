import {
    Entity,
    EntitySchema,
    PermissionsBuilder,
    Permissions
} from "../models/models";
import firebase from "firebase";

const DEFAULT_PERMISSIONS = {
    edit: true,
    create: true,
    delete: true
};

function checkHasPermissionOnEntity<S extends EntitySchema<Key>, Key extends string>
(permission: PermissionsBuilder<S, Key> | Permissions | undefined,
 user: firebase.User | null,
 entity: Entity<S, Key> | null): Permissions {

    if (permission === undefined) {
        return DEFAULT_PERMISSIONS;
    } else if (typeof permission === "object") {
        return permission as Permissions;
    } else if (typeof permission === "function") {
        return permission({ user, entity });
    }

    throw Error("New type of HasPermission added and not mapped");
}

export function canEdit<S extends EntitySchema<Key>, Key extends string>
(permission: PermissionsBuilder<S, Key> | Permissions | undefined,
 user: firebase.User | null,
 entity: Entity<S, Key>): boolean {
    return checkHasPermissionOnEntity(permission, user, entity).edit ?? DEFAULT_PERMISSIONS.edit;
}

export function canCreate<S extends EntitySchema<Key>, Key extends string>
(permission: PermissionsBuilder<S, Key> | Permissions | undefined,
 user: firebase.User | null): boolean {
    return checkHasPermissionOnEntity(permission, user, null).create ?? DEFAULT_PERMISSIONS.create;
}

export function canDelete<S extends EntitySchema<Key>, Key extends string>
(permission: PermissionsBuilder<S, Key> | Permissions | undefined,
 user: firebase.User | null,
 entity: Entity<S, Key>): boolean {
    return checkHasPermissionOnEntity(permission, user, entity).delete ?? DEFAULT_PERMISSIONS.delete;
}

