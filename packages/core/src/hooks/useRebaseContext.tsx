import { AuthController, RebaseContext, User } from "@rebasepro/types";
import { useAuthController } from "./useAuthController";
import { useSideDialogsController } from "./useSideDialogsController";
import { useCollectionRegistryController, useNavigationStateController, useCMSUrlController } from "./navigation/contexts";
import { useSideEntityController } from "./useSideEntityController";
import { useDataSource } from "./data/useDataSource";
import { useStorageSource } from "./useStorageSource";
import { useSnackbarController } from "./useSnackbarController";
import { useUserConfigurationPersistence } from "./useUserConfigurationPersistence";
import { useDialogsController } from "./useDialogsController";
import { useCustomizationController } from "./useCustomizationController";
import { useAnalyticsController } from "./useAnalyticsController";
import { useEffectiveRoleController } from "./useEffectiveRoleController";
import React, { useEffect } from "react";
import { useInternalUserManagementController } from "./useInternalUserManagementController";

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
    const sideEntityController = useSideEntityController();
    const collectionRegistry = useCollectionRegistryController();
    const navigationState = useNavigationStateController();
    const cmsUrlController = useCMSUrlController();

    const navigation = React.useMemo(() => ({
        ...collectionRegistry,
        ...navigationState,
        ...cmsUrlController,
        getCollectionBySlug: collectionRegistry.getCollection
    }), [collectionRegistry, navigationState, cmsUrlController]);
    const dataSource = useDataSource();
    const storageSource = useStorageSource();
    const snackbarController = useSnackbarController();
    const userConfigPersistence = useUserConfigurationPersistence();
    const dialogsController = useDialogsController();
    const customizationController = useCustomizationController();
    const analyticsController = useAnalyticsController();
    const effectiveRoleController = useEffectiveRoleController();
    const userManagement = useInternalUserManagementController<USER>();

    const rebaseContextRef = React.useRef<RebaseContext<USER, AuthControllerType>>({
        authController,
        sideDialogsController,
        sideEntityController,
        navigation: navigation as any,
        dataSource,
        storageSource,
        snackbarController,
        userConfigPersistence,
        dialogsController,
        customizationController,
        analyticsController,
        userManagement,
        effectiveRoleController
    });

    React.useEffect(() => {
        rebaseContextRef.current = {
            authController,
            sideDialogsController,
            sideEntityController,
            navigation: navigation as any,
            dataSource,
            storageSource,
            snackbarController,
            userConfigPersistence,
            dialogsController,
            customizationController,
            analyticsController,
            userManagement,
            effectiveRoleController
        };
    }, [authController, dialogsController, navigation, sideDialogsController, effectiveRoleController]);

    return rebaseContextRef.current;
}
