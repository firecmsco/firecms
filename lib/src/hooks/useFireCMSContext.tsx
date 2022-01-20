import { useContext } from "react";
import { FireCMSContextInstance } from "../core/contexts/FireCMSContext";

/**
 * Hook to retrieve the {@link FireCMSContext}.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS` component.
 *
 * @see FireCMSContext
 * @category Hooks and utilities
 */
export const useFireCMSContext = () => useContext(FireCMSContextInstance);
