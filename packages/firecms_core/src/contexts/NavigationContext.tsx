import React from "react";
import { NavigationController } from "@firecms/types";

export const NavigationContext = React.createContext<NavigationController>({} as NavigationController);
