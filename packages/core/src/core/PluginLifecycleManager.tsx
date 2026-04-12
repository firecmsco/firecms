import { useEffect, useRef } from "react";
import type { RebasePlugin, RebaseContext, User } from "@rebasepro/types";

/**
 * Render-less component that manages plugin lifecycle hooks.
 *
 * - Calls `lifecycle.onMount(context)` when plugins mount.
 * - Calls `lifecycle.onUnmount()` when plugins unmount.
 * - Subscribes to auth state changes and calls `lifecycle.onAuthStateChange`.
 *
 * Mount this component inside the Rebase tree, below PluginProviderStack,
 * so that the RebaseContext is fully available.
 *
 * @internal
 */
export function PluginLifecycleManager({
    plugins,
    context,
}: {
    plugins: RebasePlugin[];
    context: RebaseContext;
}) {
    const mountedRef = useRef(false);
    const prevUserRef = useRef<User | null | undefined>(undefined);

    // ── Mount / Unmount lifecycle ────────────────────────────────────
    useEffect(() => {
        // Prevent double-fire in StrictMode
        if (mountedRef.current) return;
        mountedRef.current = true;

        for (const plugin of plugins) {
            if (plugin.lifecycle?.onMount) {
                try {
                    const result = plugin.lifecycle.onMount(context);
                    if (result instanceof Promise) {
                        result.catch((err) =>
                            console.error(`[Rebase] Plugin "${plugin.key}" onMount error:`, err)
                        );
                    }
                } catch (err) {
                    console.error(`[Rebase] Plugin "${plugin.key}" onMount error:`, err);
                }
            }
        }

        return () => {
            mountedRef.current = false;
            for (const plugin of plugins) {
                if (plugin.lifecycle?.onUnmount) {
                    try {
                        plugin.lifecycle.onUnmount();
                    } catch (err) {
                        console.error(`[Rebase] Plugin "${plugin.key}" onUnmount error:`, err);
                    }
                }
            }
        };
        // Only run on mount/unmount — plugins array identity should be stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Auth state change lifecycle ──────────────────────────────────
    const currentUser = context.authController?.user ?? null;

    useEffect(() => {
        // Skip the initial call — onMount handles that
        if (prevUserRef.current === undefined) {
            prevUserRef.current = currentUser;
            return;
        }

        // Only fire when the user identity actually changes
        const prevUid = prevUserRef.current?.uid;
        const currUid = currentUser?.uid;
        if (prevUid === currUid) return;

        prevUserRef.current = currentUser;

        for (const plugin of plugins) {
            if (plugin.lifecycle?.onAuthStateChange) {
                try {
                    plugin.lifecycle.onAuthStateChange(currentUser);
                } catch (err) {
                    console.error(
                        `[Rebase] Plugin "${plugin.key}" onAuthStateChange error:`,
                        err
                    );
                }
            }
        }
    }, [currentUser, plugins]);

    return null;
}
