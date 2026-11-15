import React from "react";
import { NavigationController } from "../types/index.js";

export const NavigationContext = React.createContext<NavigationController>({} as NavigationController);
