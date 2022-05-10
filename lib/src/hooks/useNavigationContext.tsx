import { NavigationContext } from "../models";
import { useFireCMSContext } from "./useFireCMSContext";

/**
 * Use this hook to get the navigation of the app.
 * This controller provides the resolved collections for the CMS as well
 * as utility methods.
 *
 * @category Hooks and utilities
 */
export function useNavigationContext(): NavigationContext {
    const context = useFireCMSContext();
    return context.navigation;
}
