import { AuthController, User } from "@firecms/types";
import { useContext } from "react";
import { AuthControllerContext } from "../contexts/AuthControllerContext";

/**
 * Hook to retrieve the AuthContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see AuthController
 * @group Hooks and utilities
 */
export const useAuthController = <USER extends User = User, AuthControllerType extends AuthController<USER> = AuthController<USER>>(): AuthControllerType => useContext(AuthControllerContext) as AuthControllerType;
