import type { EffectiveRoleController } from "@rebasepro/types";
import React from "react";
;

const DEFAULT_EFFECTIVE_ROLE_STATE: EffectiveRoleController = {
    effectiveRole: null,
    setEffectiveRole: (_role: string | null) => {
    },
};
export const EffectiveRoleControllerContext = React.createContext<EffectiveRoleController>(DEFAULT_EFFECTIVE_ROLE_STATE);

export const EffectiveRoleControllerProvider = EffectiveRoleControllerContext.Provider;
