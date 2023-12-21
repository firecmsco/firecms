import { useContext } from "react";
import { NavigationController } from "../types";
import { NavigationContext } from "../contexts/NavigationContext";

/**
 * Use this hook to get the navigation of the app.
 * This controller provides the resolved collections for the CMS as well
 * as utility methods.
 *
 * @group Hooks and utilities
 */
export const useNavigationController = (): NavigationController => useContext(NavigationContext);
