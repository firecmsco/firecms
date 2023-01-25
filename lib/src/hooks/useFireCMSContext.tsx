import { createContext, useContext } from "react";
import { AuthController, FireCMSContext, User } from "../types";

export const FireCMSContextInstance = createContext<FireCMSContext>({
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
export const useFireCMSContext = <UserType extends User = User, AuthControllerType extends AuthController<UserType> = AuthController<UserType>>(): FireCMSContext<UserType, AuthControllerType> => useContext(FireCMSContextInstance) as FireCMSContext<UserType, AuthControllerType>;
