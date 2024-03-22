import { Role, User } from "@firecms/core";
import { CollectionEditorPermissions, PersistedCollection } from "@firecms/collection_editor";
import { getUserRoles, UserManagement } from "@firecms/user_management";

export const RESERVED_GROUPS = ["Admin"];

export function resolveCollectionConfigPermissions<U extends User = User>({
                                                                              user,
                                                                              userManagement,
                                                                              collection
                                                                          }: {
    user: User | null,
    userManagement: UserManagement<U>,
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
