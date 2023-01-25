import { AuthController, SideEntityController } from "../types";
import { useContext } from "react";
import {
    SideEntityControllerContext
} from "../core/contexts/SideEntityControllerContext";

/**
 * Hook to retrieve the side entity controller.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see AuthController
 * @category Hooks and utilities
 */
export const useSideEntityController = (): SideEntityController => useContext(SideEntityControllerContext);
