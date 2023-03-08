import { createContext, useContext } from "react";
import { AuthController, FireCMSContext, User } from "../types";
import { useAuthController } from "./useAuthController";
import { useSideDialogsController } from "./useSideDialogsController";
import { useNavigationContext } from "./useNavigationContext";
import { useSideEntityController } from "./useSideEntityController";
import { useDataSource } from "./data/useDataSource";
import { useStorageSource } from "./useStorageSource";
import { useSnackbarController } from "./useSnackbarController";
import {
    useUserConfigurationPersistence
} from "./useUserConfigurationPersistence";

export const FireCMSContextInstance = createContext<Partial<FireCMSContext>>({
    sideDialogsController: {} as any,
    sideEntityController: {} as any,
    navigation: {} as any,
    dataSource: {} as any,
    storageSource: {} as any,
    authController: {} as any,
    snackbarController: {} as any,
    fields: {}
});

/**
 * Hook to retrieve the {@link FireCMSContext}.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS` component.
 *
 * @see FireCMSContext
 * @category Hooks and utilities
 */
export const useFireCMSContext = <UserType extends User = User, AuthControllerType extends AuthController<UserType> = AuthController<UserType>>(): FireCMSContext<UserType, AuthControllerType> => {

    const partialContext = useContext(FireCMSContextInstance) as FireCMSContext<UserType, AuthControllerType>;
    const authController = useAuthController<UserType, AuthControllerType>();
    const sideDialogsController = useSideDialogsController();
    const sideEntityController = useSideEntityController();
    const navigation = useNavigationContext();
    const dataSource = useDataSource();
    const storageSource = useStorageSource();
    const snackbarController = useSnackbarController();
    const userConfigPersistence = useUserConfigurationPersistence();

    return {
        ...partialContext,
        authController,
        sideDialogsController,
        sideEntityController,
        navigation,
        dataSource,
        storageSource,
        snackbarController,
        userConfigPersistence
    }

};
