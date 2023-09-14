import { AuthController, User } from "../types";
import { useContext } from "react";
import { AuthControllerContext } from "../core/contexts/AuthControllerContext";

/**
 * Hook to retrieve the AuthContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see AuthController
 * @category Hooks and utilities
 */
export const useAuthController = <UserType extends User = User, AuthControllerType extends AuthController<UserType> = AuthController<UserType>>(): AuthControllerType => useContext(AuthControllerContext) as AuthControllerType;
