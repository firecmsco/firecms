import { AuthController, FireCMSContext, User } from "../types/index.js";
import { useAuthController } from "./useAuthController.js";
import { useSideDialogsController } from "./useSideDialogsController.js";
import { useNavigationController } from "./useNavigationController.js";
import { useSideEntityController } from "./useSideEntityController.js";
import { useDataSource } from "./data/useDataSource.js";
import { useStorageSource } from "./useStorageSource.js";
import { useSnackbarController } from "./useSnackbarController.js";
import { useUserConfigurationPersistence } from "./useUserConfigurationPersistence.js";
import { useDialogsController } from "./useDialogsController.js";
import { useCustomizationController } from "./useCustomizationController.js";
import { useAnalyticsController } from "./useAnalyticsController.js";
import React, { useEffect } from "react";
import { useInternalUserManagementController } from "./useInternalUserManagementController.js";
import { useLicenseStatus } from "./useLicenseStatus.js";

/**
 * Hook to retrieve the {@link FireCMSContext}.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS` component.
 *
 * @see FireCMSContext
 * @group Hooks and utilities
 */
export const useFireCMSContext = <USER extends User = User, AuthControllerType extends AuthController<USER> = AuthController<USER>>(): FireCMSContext<USER, AuthControllerType> => {

    const authController = useAuthController<USER, AuthControllerType>();
    const sideDialogsController = useSideDialogsController();
    const sideEntityController = useSideEntityController();
    const navigation = useNavigationController();
    const dataSource = useDataSource();
    const storageSource = useStorageSource();
    const snackbarController = useSnackbarController();
    const userConfigPersistence = useUserConfigurationPersistence();
    const dialogsController = useDialogsController();
    const customizationController = useCustomizationController();
    const analyticsController = useAnalyticsController();
    const userManagement = useInternalUserManagementController<USER>();
    const licenseStatus = useLicenseStatus();

    const fireCMSContextRef = React.useRef<FireCMSContext<USER, AuthControllerType>>({
        authController,
        sideDialogsController,
        sideEntityController,
        navigation,
        dataSource,
        storageSource,
        snackbarController,
        userConfigPersistence,
        dialogsController,
        customizationController,
        analyticsController,
        userManagement,
        licenseStatus
    });

    useEffect(() => {
        fireCMSContextRef.current = {
            authController,
            sideDialogsController,
            sideEntityController,
            navigation,
            dataSource,
            storageSource,
            snackbarController,
            userConfigPersistence,
            dialogsController,
            customizationController,
            analyticsController,
            userManagement,
            licenseStatus
        };
    }, [authController, dialogsController, navigation, sideDialogsController, licenseStatus]);

    return fireCMSContextRef.current;
}
