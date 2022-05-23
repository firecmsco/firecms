import {
    AuthController,
    EntityCollection,
    Permissions,
    segmentsToStrippedPath,
    User
} from "@camberi/firecms";
import { Role } from "../models/roles";

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
    if (!authController.extra?.roles) {
        return DEFAULT_PERMISSIONS;
    } else {
        const strippedCollectionPath = segmentsToStrippedPath(paths);
        return resolveCollectionPermissions(authController.extra.roles, strippedCollectionPath);
    }
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


const mergePermissions = (permA: Permissions, permB: Permissions) => {
    return {
        read: permA.read ?? permB.read,
        create: permA.create ?? permB.create,
        edit: permA.edit ?? permB.edit,
        delete: permA.delete ?? permB.delete
    };
}


