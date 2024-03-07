import { CMSType, Permissions, User } from "@firecms/core";
import { CollectionEditorPermissions, PersistedCollection } from "@firecms/collection_editor";
import { FireCMSUserProject } from "../types";
import { Role } from "@firecms/firebase";
import { UserManagement } from "../types/user_management";

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
        const basePermissions = {
            read: false,
            create: false,
            edit: false,
            delete: false
        };

        return roles
            .map(role => resolveCollectionRole(role, collection.id))
            .reduce(mergePermissions, basePermissions);
    }
}

function resolveCollectionRole(role: Role, id: string): Permissions {

    const basePermissions = {
        read: role.isAdmin || role.defaultPermissions?.read,
        create: role.isAdmin || role.defaultPermissions?.create,
        edit: role.isAdmin || role.defaultPermissions?.edit,
        delete: role.isAdmin || role.defaultPermissions?.delete
    };
    if (role.collectionPermissions && role.collectionPermissions[id]) {
        return mergePermissions(role.collectionPermissions[id], basePermissions);
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
                                                       userManagement,
                                                       collection
                                                   }: {
    user: User | null,
    userManagement: UserManagement,
    collection?: PersistedCollection
}): CollectionEditorPermissions {

    const baseConfigPermissions = {
        createCollections: false,
        editCollections: false,
        deleteCollections: false
    };

    const fireCMSUser = user && userManagement.users.find((u) => u.uid === user.uid);
    const userRoles: Role[] | undefined = fireCMSUser ? getUserRoles(userManagement.roles, fireCMSUser) : undefined;
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
