import type { SideEntityController } from "@rebasepro/types";
import { useContext } from "react";
import { SideEntityControllerContext } from "../contexts/SideEntityControllerContext";

/**
 * Use this hook to retrieve an entity controller that allows you to open
 * a side dialog to edit an entity.
 *
 * Consider that in order to use this hook you need to have a parent
 * `Rebase`
 *
 * @see SideEntityController
 * @group Hooks and utilities
 */
export const useSideEntityController = (): SideEntityController => useContext(SideEntityControllerContext);
