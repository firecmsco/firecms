import React, { useMemo } from "react";
import {
    useRebaseRegistry,
} from "@rebasepro/core";

import { RebaseAuthGate } from "./RebaseAuthGate";
import { RebaseNavigation } from "./RebaseNavigation";
import { RebaseLayout } from "./RebaseLayout";
import { RebaseRouteDefs } from "./RebaseRouteDefs";

export interface RebaseShellProps {
    title?: string;
    appBar?: React.ReactNode;
    drawer?: React.ReactNode;
    autoOpenDrawer?: boolean;
    children?: React.ReactNode;
}

/**
 * Convenience component that composes all four CMS layers:
 *
 * ```
 * <RebaseAuthGate>
 *   <RebaseNavigation>
 *     <RebaseRouteDefs layout={<RebaseLayout>}>
 *       {children}
 *     </RebaseRouteDefs>
 *   </RebaseNavigation>
 * </RebaseAuthGate>
 * ```
 *
 * Each layer is independently usable — see their individual docs.
 * RebaseShell is sugar that composes them all with sensible defaults.
 */
export function RebaseShell(props: RebaseShellProps) {
    const {
        title = "Rebase",
        appBar,
        drawer,
        autoOpenDrawer = false,
        children
    } = props;

    const registry = useRebaseRegistry();

    // Compute devViews for the layout's AdminModeSyncer
    const devViews = useMemo(() => {
        return registry.studioConfig?.devViews ?? [];
    }, [registry.studioConfig?.devViews]);

    return (
        <RebaseAuthGate>
            <RebaseNavigation>
                <RebaseRouteDefs
                    layout={
                        <RebaseLayout
                            title={title}
                            appBar={appBar}
                            drawer={drawer}
                            autoOpenDrawer={autoOpenDrawer}
                            devViews={devViews}
                        />
                    }
                >
                    {children}
                </RebaseRouteDefs>
            </RebaseNavigation>
        </RebaseAuthGate>
    );
}
