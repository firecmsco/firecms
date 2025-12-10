import { useEffect, useState } from 'react';

export function useEmbedPortal(): HTMLElement | undefined {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | undefined>();

    useEffect(() => {
        // Walk up the DOM tree to find the shadow root
        let element = document.activeElement;

        // If we're in a shadow DOM, getRootNode() will return the shadow root
        while (element) {
            const root = element.getRootNode();
            if (root instanceof ShadowRoot) {
                setPortalContainer((root as any).__portalContainer);
                return;
            }
            element = element.parentElement;
        }
    }, []);

    return portalContainer;
}
