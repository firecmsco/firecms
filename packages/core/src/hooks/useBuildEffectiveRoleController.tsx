import { useCallback, useState } from "react";
import { EffectiveRoleController } from "@rebasepro/types";

/**
 * Use this hook to build an effective role controller that determines
 * what role is simulated in Editor mode when Dev mode is active.
 *
 * It uses localStorage to persist the simulated role across reloads.
 */
export function useBuildEffectiveRoleController(): EffectiveRoleController {

    const savedRole = typeof window !== "undefined" ? localStorage.getItem("rebase-effective-role") : null;
    const [effectiveRole, setEffectiveRole] = useState<string | null>(savedRole ?? null);

    const setRoleInternal = useCallback((newRole: string | null) => {
        if (typeof window !== "undefined") {
            if (newRole) {
                localStorage.setItem("rebase-effective-role", newRole);
            } else {
                localStorage.removeItem("rebase-effective-role");
            }
        }
        setEffectiveRole(newRole);
    }, []);

    return {
        effectiveRole,
        setEffectiveRole: setRoleInternal
    };
}
