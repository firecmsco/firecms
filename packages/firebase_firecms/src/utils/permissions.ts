import { CMSType, Permissions, segmentsToStrippedPath, User } from "@firecms/core";
import { CollectionEditorPermissions, PersistedCollection } from "@firecms/collection_editor";
import { Role, FireCMSUserProject } from "../types";
import { ProjectConfig } from "../hooks";

export const RESERVED_GROUPS = ["Admin"];

const DEFAULT_PERMISSIONS = {
    read: false,
    edit: false,
    create: false,
    delete: false
};

export function resolveUserRolePermissions<M extends {
    [Key: string]: CMSType
}, UserType extends User>
({ collection, roles, paths, user }: {
    collection: PersistedCollection<M>,
    roles?: Role[],
    paths: string[],
    user: UserType | null
}): Permissions {

    if (!roles) {
        return DEFAULT_PERMISSIONS;
    } else if (collection.ownerId === user?.uid) {
        return {
            read: true,
            create: true,
            edit: true,
            delete: true
        };
    } else {
        const strippedCollectionPath = segmentsToStrippedPath(paths);
        return resolveCollectionPermissions(roles, strippedCollectionPath);
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
        read: role.isAdmin || role.defaultPermissions?.read,
        create: role.isAdmin || role.defaultPermissions?.create,
        edit: role.isAdmin || role.defaultPermissions?.edit,
        delete: role.isAdmin || role.defaultPermissions?.delete
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
        read: permA.read || permB.read,
        create: permA.create || permB.create,
        edit: permA.edit || permB.edit,
        delete: permA.delete || permB.delete
    };
}

export function getUserRoles(roles: Role[], fireCMSUser: FireCMSUserProject): Role[] | undefined {
    return !roles
        ? undefined
        : (fireCMSUser.roles
            ? fireCMSUser.roles
                .map(roleId => roles.find((r) => r.id === roleId))
                .filter(Boolean) as Role[]
            : []);
}

export function resolveCollectionConfigPermissions({
                                                       user,
                                                       currentProjectController,
                                                       collection
                                                   }: {
    user: User | null,
    currentProjectController: ProjectConfig,
    collection?: PersistedCollection
}): CollectionEditorPermissions {

    const baseConfigPermissions = {
        createCollections: false,
        editCollections: false,
        deleteCollections: false
    };

    const fireCMSUser = user && currentProjectController.users.find((u) => u.uid === user.uid);
    const userRoles: Role[] | undefined = fireCMSUser ? getUserRoles(currentProjectController.roles, fireCMSUser) : undefined;
    if (!fireCMSUser || !userRoles) {
        return baseConfigPermissions;
    }

    return userRoles
        .map(role => ({
            createCollections: role.isAdmin || role.config?.createCollections === true,
            editCollections: role.isAdmin || role.config?.editCollections === true || (role.config?.editCollections === "own" && collection?.ownerId === fireCMSUser?.uid),
            deleteCollections: role.isAdmin || role.config?.deleteCollections === true || (role.config?.deleteCollections === "own" && collection?.ownerId === fireCMSUser?.uid)
        }))
        .reduce(mergeConfigPermissions, baseConfigPermissions);
}

const mergeConfigPermissions = (permA: CollectionEditorPermissions, permB: CollectionEditorPermissions) => {
    return {
        createCollections: permA.createCollections || permB.createCollections,
        editCollections: permA.editCollections || permB.editCollections,
        deleteCollections: permA.deleteCollections || permB.deleteCollections
    };
}

export const areRolesEqual = (rolesA: string[], rolesB: string[]) => {
    return rolesA.length === rolesB.length && rolesA.every((role) => rolesB.includes(role));
}
