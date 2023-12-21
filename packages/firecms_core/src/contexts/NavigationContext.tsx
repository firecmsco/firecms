import React from "react";
import { NavigationController } from "../types";

export const NavigationContext = React.createContext<NavigationController>({} as NavigationController);
