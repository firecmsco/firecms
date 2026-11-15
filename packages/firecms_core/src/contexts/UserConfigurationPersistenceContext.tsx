import React from "react";
import { UserConfigurationPersistence } from "../types/index.js";

export const UserConfigurationPersistenceContext = React.createContext<UserConfigurationPersistence | undefined>(undefined);
