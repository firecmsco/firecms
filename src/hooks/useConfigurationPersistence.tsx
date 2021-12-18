import { useFireCMSContext } from "./useFireCMSContext";
import { ConfigurationPersistence } from "../models/config_persistence";


/**
 * Use this controller to access the configuration that is stored extenally,
 * and not defined in code
 *
 * @category Hooks and utilities
 */
export function useConfigurationPersistence(): ConfigurationPersistence | undefined {
    const context = useFireCMSContext();
    return context.configurationPersistence;
}
