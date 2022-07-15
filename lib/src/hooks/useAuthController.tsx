import { AuthController, User } from "../models";
import { useFireCMSContext } from "./useFireCMSContext";

/**
 * Hook to retrieve the AuthContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see AuthController
 * @category Hooks and utilities
 */
export function useAuthController<UserType extends User = User>(): AuthController<UserType> {
    const context = useFireCMSContext<UserType>();
    return context.authController;
}
