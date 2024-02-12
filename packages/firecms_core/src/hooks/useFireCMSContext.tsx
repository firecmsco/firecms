import { AuthController, FireCMSContext, User } from "../types";
import { useAuthController } from "./useAuthController";
import { useSideDialogsController } from "./useSideDialogsController";
import { useNavigationController } from "./useNavigationController";
import { useSideEntityController } from "./useSideEntityController";
import { useDataSource } from "./data/useDataSource";
import { useStorageSource } from "./useStorageSource";
import { useSnackbarController } from "./useSnackbarController";
import { useUserConfigurationPersistence } from "./useUserConfigurationPersistence";
import { useDialogsController } from "./useDialogsController";
import { useCustomizationController } from "./useCustomizationController";
import { useAnalyticsController } from "./useAnalyticsController";
import React, { useEffect } from "react";

/**
 * Hook to retrieve the {@link FireCMSContext}.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS` component.
 *
 * @see FireCMSContext
 * @group Hooks and utilities
 */
export const useFireCMSContext = <UserType extends User = User, AuthControllerType extends AuthController<UserType> = AuthController<UserType>>(): FireCMSContext<UserType, AuthControllerType> => {

    const authController = useAuthController<UserType, AuthControllerType>();
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

    const fireCMSContextRef = React.useRef<FireCMSContext<UserType, AuthControllerType>>({
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
        analyticsController
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
            analyticsController
        };
    }, [authController, dialogsController, navigation, sideDialogsController]);

    return fireCMSContextRef.current;
}

// export const useFireCMSContext = <UserType extends User = User, AuthControllerType extends AuthController<UserType> = AuthController<UserType>>(): FireCMSContext<UserType, AuthControllerType> => {
//
//     const authController = useAuthController<UserType, AuthControllerType>();
//     const sideDialogsController = useSideDialogsController();
//     const sideEntityController = useSideEntityController();
//     const navigation = useNavigationController();
//     const dataSource = useDataSource();
//     const storageSource = useStorageSource();
//     const snackbarController = useSnackbarController();
//     const userConfigPersistence = useUserConfigurationPersistence();
//     const dialogsController = useDialogsController();
//     const customizationController = useCustomizationController();
//     const analyticsController = useAnalyticsController();
//
//     return {
//         authController,
//         sideDialogsController,
//         sideEntityController,
//         navigation,
//         dataSource,
//         storageSource,
//         snackbarController,
//         userConfigPersistence,
//         dialogsController,
//         customizationController,
//         analyticsController
//     };
//
// };
