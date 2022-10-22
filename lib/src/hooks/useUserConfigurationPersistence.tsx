import { useFireCMSContext } from "./useFireCMSContext";
import { UserConfigurationPersistence } from "../types";

/**
 * Use this controller to access the configuration that is stored extenally,
 * and not defined in code
 *
 * @category Hooks and utilities
 */
export function useUserConfigurationPersistence(): UserConfigurationPersistence | undefined {
    const context = useFireCMSContext();
    return context.userConfigPersistence;
}
