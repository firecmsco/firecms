import type { RebasePlugin } from "@rebasepro/types";
import React from "react";
;

/**
 * Wraps children with all provider components from plugins that match the given scope.
 *
 * Replaces the 3 copy-pasted `plugins.forEach(plugin => { if (plugin.form?.provider) ... })` patterns
 * in Rebase.tsx, EntityEditView.tsx, and PopupFormField.tsx.
 *
 * @param plugins - Array of plugins to extract providers from.
 * @param scope - `"root"` or `"form"` — which providers to apply.
 * @param scopeProps - Additional props passed to each provider component.
 * @param children - The content to wrap.
 *
 * @group Core
 */
export function PluginProviderStack({
    plugins,
    scope,
    scopeProps,
    children,
}: {
    plugins: RebasePlugin[];
    scope: "root" | "form";
    scopeProps?: Record<string, unknown>;
    children: React.ReactNode;
}) {
    const providers = plugins.flatMap(p => p.providers ?? [])
        .filter(p => p.scope === scope);

    return providers.reduceRight<React.ReactNode>(
        (acc, provider) => (
            <provider.Component {...provider.props} {...scopeProps}>
                {acc}
            </provider.Component>
        ),
        children
    );
}
