import type { SideEntityController } from "@rebasepro/types";
import React, { useContext } from "react";

export const SideEntityControllerContext = React.createContext<SideEntityController>({} as SideEntityController);

/**
 * Use this hook to retrieve an entity controller that allows you to open
 * a side dialog to edit an entity.
 *
 * @see SideEntityController
 * @group Hooks and utilities
 */
export const useSideEntityController = (): SideEntityController => useContext(SideEntityControllerContext);
