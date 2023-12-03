import { UserConfigurationPersistence } from "../types";
import { useContext } from "react";
import { UserConfigurationPersistenceContext } from "../contexts/UserConfigurationPersistenceContext";

/**
 * Use this controller to access the configuration that is stored externally,
 * and not defined in code
 *
 * @group Hooks and utilities
 */
export const useUserConfigurationPersistence = (): UserConfigurationPersistence | undefined => useContext(UserConfigurationPersistenceContext);
