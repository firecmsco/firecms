import { AuthController, RebaseContext, User } from "@rebasepro/types";
import { useAuthController } from "./useAuthController";
import { useSideDialogsController } from "./useSideDialogsController";
import { useCollectionRegistryController, useNavigationStateController, useUrlController } from "./navigation/contexts";

import { useData } from "./data/useData";
import { useStorageSource } from "./useStorageSource";
import { useSnackbarController } from "./useSnackbarController";
import { useUserConfigurationPersistence } from "./useUserConfigurationPersistence";
import { useDialogsController } from "./useDialogsController";
import { useCustomizationController } from "./useCustomizationController";
import { useAnalyticsController } from "./useAnalyticsController";
import { useEffectiveRoleController } from "./useEffectiveRoleController";
import React, { useEffect, useContext } from "react";
import { useInternalUserManagementController } from "./useInternalUserManagementController";

// Temporary context for databaseAdmin - assuming we might add one, or we need to get it from Rebase.tsx.
// Wait, `databaseAdmin` hasn't been added to a context yet. Let's add it to a context in Rebase.tsx later.
// Let's create a placeholder for databaseAdmin context access.
import { DatabaseAdminContext } from "../contexts/DatabaseAdminContext";

/**
 * Hook to retrieve the {@link RebaseContext}.
 *
 * Consider that in order to use this hook you need to have a parent
 * `Rebase` component.
 *
 * @see RebaseContext
 * @group Hooks and utilities
 */
export const useRebaseContext = <USER extends User = User, AuthControllerType extends AuthController<USER> = AuthController<USER>>(): RebaseContext<USER, AuthControllerType> => {

    const authController = useAuthController<USER, AuthControllerType>();
    const sideDialogsController = useSideDialogsController();
    const collectionRegistry = useCollectionRegistryController();
    const navigationState = useNavigationStateController();
    const urlController = useUrlController();

    const data = useData();
    const storageSource = useStorageSource();
    const snackbarController = useSnackbarController();
    const userConfigPersistence = useUserConfigurationPersistence();
    const dialogsController = useDialogsController();
    const customizationController = useCustomizationController();
    const analyticsController = useAnalyticsController();
    const effectiveRoleController = useEffectiveRoleController();
    const userManagement = useInternalUserManagementController<USER>();
    
    // Will get `databaseAdmin` from context
    const databaseAdmin = useContext(DatabaseAdminContext);

    const rebaseContextRef = React.useRef<RebaseContext<USER, AuthControllerType>>({
        authController,
        sideDialogsController,
        urlController,
        collectionRegistryController: collectionRegistry,
        navigationStateController: navigationState,
        data,
        storageSource,
        snackbarController,
        userConfigPersistence,
        dialogsController,
        customizationController,
        analyticsController,
        userManagement,
        effectiveRoleController,
        databaseAdmin
    });

    React.useEffect(() => {
        rebaseContextRef.current = {
            authController,
            sideDialogsController,
            urlController,
            collectionRegistryController: collectionRegistry,
            navigationStateController: navigationState,
            data,
            storageSource,
            snackbarController,
            userConfigPersistence,
            dialogsController,
            customizationController,
            analyticsController,
            userManagement,
            effectiveRoleController,
            databaseAdmin
        };
    }, [authController, dialogsController, sideDialogsController, effectiveRoleController, data, databaseAdmin, urlController, collectionRegistry, navigationState]);

    return rebaseContextRef.current;
}
