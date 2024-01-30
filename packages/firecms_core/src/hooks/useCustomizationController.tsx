import { useContext } from "react";
import { CustomizationController } from "../types/customization_controller";
import { CustomizationControllerContext } from "../contexts/CustomizationControllerContext";

/**
 * Use this hook to retrieve the customization controller.
 * This hook includes all the customization options that can be used
 * to customize the CMS.
 *
 * You will likely not need to use this hook directly.
 *
 * @group Hooks and utilities
 */
export const useCustomizationController = (): CustomizationController => useContext(CustomizationControllerContext);
