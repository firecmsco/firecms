import { useContext } from "react";
import { EffectiveRoleControllerContext } from "../contexts/EffectiveRoleController";

/**
 * Hook to retrieve the {@link EffectiveRoleController}
 *
 * @see EffectiveRoleController
 * @category Hooks and utilities
 */
export const useEffectiveRoleController = () => useContext(EffectiveRoleControllerContext);
