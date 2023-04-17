import { SideEntityController } from "../types";
import { useContext } from "react";
import {
    SideEntityControllerContext
} from "../core/contexts/SideEntityControllerContext";

/**
 * Use this hook to retrieve an entity controller that allows you to open
 * a side dialog to edit an entity.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see SideEntityController
 * @category Hooks and utilities
 */
export const useSideEntityController = (): SideEntityController => useContext(SideEntityControllerContext);
