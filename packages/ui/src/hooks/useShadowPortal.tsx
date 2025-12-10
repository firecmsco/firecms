import { useCallback, useState } from "react";

export function useShadowPortal(providedRef?: React.Ref<HTMLElement>) {
    const [container, setContainer] = useState<HTMLElement | undefined>(undefined);

    const ref = useCallback((node: HTMLElement | null) => {
        // 1. Forward the ref to the user provided ref (if it exists)
        if (providedRef) {
            if (typeof providedRef === "function") {
                providedRef(node);
            } else {
                (providedRef as React.MutableRefObject<HTMLElement | null>).current = node;
            }
        }

        // 2. Efficiently detect Shadow DOM on mount
        if (node) {
            const root = node.getRootNode();
            if (root instanceof ShadowRoot) {
                setContainer(root as any);
            } else {
                setContainer(document.body);
            }
        }
    }, [providedRef]);

    return {
        ref,
        container
    };
}
