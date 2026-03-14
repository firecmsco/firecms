import React from "react";
import { EffectiveRoleController } from "@rebasepro/types";

const DEFAULT_EFFECTIVE_ROLE_STATE: EffectiveRoleController = {
    effectiveRole: null,
    setEffectiveRole: (_role: string | null) => {
    },
};
export const EffectiveRoleControllerContext = React.createContext<EffectiveRoleController>(DEFAULT_EFFECTIVE_ROLE_STATE);

export const EffectiveRoleControllerProvider = EffectiveRoleControllerContext.Provider;
