import type { CustomizationController } from "@rebasepro/types/cms";
import React from "react";
;

export const CustomizationControllerContext = React.createContext<CustomizationController>({} as CustomizationController);
