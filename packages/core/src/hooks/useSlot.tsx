import type { SlotName, SlotRegistry } from "@rebasepro/types";
import React, { useMemo } from "react";
;
import { useCustomizationController } from "./useCustomizationController";
import { ErrorBoundary } from "@rebasepro/ui";

/**
 * Hook that retrieves and renders all slot contributions for a given slot name.
 *
 * @param slot - The slot name to render contributions for.
 * @param props - Props passed to each slot component.
 * @returns An array of rendered React nodes, each wrapped in an ErrorBoundary.
 *
 * @example
 * ```tsx
 * const actions = useSlot("home.actions", { context });
 * return <div>{actions}</div>;
 * ```
 *
 * @group Hooks
 */
export function useSlot<K extends SlotName>(
    slot: K,
    props: SlotRegistry[K]
): React.ReactNode[] {
    const { resolvedSlots } = useCustomizationController();

    return useMemo(() => {
        return resolvedSlots
            .filter(s => s.slot === slot)
            .sort((a, b) => (a.order ?? 50) - (b.order ?? 50))
            .map((s, i) => (
                <ErrorBoundary key={`${slot}_${i}`}>
                    <s.Component {...(props as unknown as Record<string, unknown>)} {...(s.props ?? {})} />
                </ErrorBoundary>
            ));
    }, [resolvedSlots, slot, props]);
}
