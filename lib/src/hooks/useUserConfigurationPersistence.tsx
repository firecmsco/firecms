import { UserConfigurationPersistence } from "../types";
import React, { useContext } from "react";
import {
    UserConfigurationPersistenceContext
} from "../core/contexts/UserConfigurationPersistenceContext";

/**
 * Use this controller to access the configuration that is stored externally,
 * and not defined in code
 *
 * @category Hooks and utilities
 */
export const useUserConfigurationPersistence = (): UserConfigurationPersistence | undefined => useContext(UserConfigurationPersistenceContext);
