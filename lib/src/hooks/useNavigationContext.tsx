import { NavigationContext } from "../types";
import { useContext } from "react";
import { NavigationContextInstance } from "../core/contexts/NavigationContext";

/**
 * Use this hook to get the navigation of the app.
 * This controller provides the resolved collections for the CMS as well
 * as utility methods.
 *
 * @category Hooks and utilities
 */
export const useNavigationContext = (): NavigationContext => useContext(NavigationContextInstance);
