import { useAuthController } from "./useAuthController";
import { EntityCollection, Entity } from "@rebasepro/types";
import { canCreateEntity, canEditEntity, canDeleteEntity, canReadCollection } from "@rebasepro/common";
import { useCallback } from "react";

/**
 * Hook to evaluate roles and permissions for the current user.
 * It abstracts away the need to pass `authController` to permission evaluation functions.
 */
export function usePermissions() {
    const authController = useAuthController();

    const canCreate = useCallback(
        (collection: EntityCollection<any>, path: string) =>
            canCreateEntity(collection, authController, path, null),
        [authController]
    );

    const canEdit = useCallback(
        (collection: EntityCollection<any>, path: string, entity: Entity<any> | null) =>
            canEditEntity(collection, authController, path, entity),
        [authController]
    );

    const canDelete = useCallback(
        (collection: EntityCollection<any>, path: string, entity: Entity<any> | null) =>
            canDeleteEntity(collection, authController, path, entity),
        [authController]
    );

    const canRead = useCallback(
        (collection: EntityCollection<any>) =>
            canReadCollection(collection, authController),
        [authController]
    );

    return {
        canCreate,
        canEdit,
        canDelete,
        canRead
    };
}
