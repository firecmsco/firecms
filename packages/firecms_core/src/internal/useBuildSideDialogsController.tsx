import { useCallback, useEffect, useRef, useState } from "react";
import { SideDialogPanelProps, SideDialogsController } from "../types";
import equal from "react-fast-compare"

export function useBuildSideDialogsController(): SideDialogsController {

    const [sidePanels, setSidePanels] = useState<SideDialogPanelProps[]>([]);
    const sidePanelsRef = useRef<SideDialogPanelProps[]>(sidePanels);
    // record path => panel keys
    const panelsHistory = useRef<Record<string, { baseLocation: string, keys: string[] }>>({});

    const routesStore = useRef<Record<string, SideDialogPanelProps>>({});
    const routesCount = useRef<number>(0);

    const updateSidePanels = useCallback((newPanels: SideDialogPanelProps[]) => {
        sidePanelsRef.current = newPanels;
        setSidePanels(newPanels);
    }, []);

    useEffect(() => {
        const handleLocationChange = () => {
            const path = window.location.pathname;
            const panelKeys = panelsHistory.current[path]?.keys ?? [];
            const newPanels = panelKeys
                .map(key => routesStore.current[key])
                .filter(p => Boolean(p)) as SideDialogPanelProps[];
            const currentPanelKeys = sidePanelsRef.current.map(p => p.key);
            if (!equal(currentPanelKeys, newPanels.map(p => p.key)))
                updateSidePanels(newPanels);
        };

        window.addEventListener("popstate", handleLocationChange);

        handleLocationChange();

        return () => {
            window.removeEventListener("popstate", handleLocationChange);
        };
    }, [updateSidePanels]);

    const updateBrowserUrl = useCallback((path: string, replace = false) => {
        const currentPath = window.location.pathname
        const url = `${window.location.origin}/${path}`;
        if (replace) {
            window.history.replaceState({}, "", url);
        } else {
            window.history.pushState({}, "", url);
        }
        const baseLocation = panelsHistory.current[currentPath]?.baseLocation ?? currentPath;
        panelsHistory.current["/" + path] = { baseLocation, keys: sidePanelsRef.current.map(p => p.key) };
    }, []);

    const close = useCallback(() => {

        if (sidePanels.length === 0)
            return;

        const lastSidePanel = sidePanels[sidePanels.length - 1];
        const updatedPanels = [...sidePanels.slice(0, -1)];
        updateSidePanels(updatedPanels);

        if (routesCount.current > 0) {
            if (lastSidePanel.urlPath)
                history.back();
            routesCount.current--;
        } else if (lastSidePanel.parentUrlPath) {
            updateBrowserUrl(lastSidePanel.parentUrlPath, true);
        }
    }, [sidePanels, updateBrowserUrl, updateSidePanels]);

    const open = useCallback((panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => {

        console.trace("open", panelProps)

        const newPanels: SideDialogPanelProps[] = Array.isArray(panelProps) ? panelProps : [panelProps];

        newPanels.forEach((panel) => {
            routesStore.current[panel.key] = panel;
        });
        routesCount.current = routesCount.current + newPanels.length;

        const updatedPanels = [...sidePanels, ...newPanels];
        updateSidePanels(updatedPanels);

        newPanels.forEach((panel) => {
            if (panel.urlPath) {
                updateBrowserUrl(panel.urlPath, false);
            }
        });

    }, [sidePanels, updateBrowserUrl, updateSidePanels]);

    const replace = useCallback((panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => {

        const newPanels: SideDialogPanelProps[] = Array.isArray(panelProps) ? panelProps : [panelProps];
        newPanels.forEach((panel) => {
            routesStore.current[panel.key] = panel;
        });

        const updatedPanels = [...sidePanels.slice(0, -newPanels.length), ...newPanels];
        updateSidePanels(updatedPanels);

        newPanels.forEach((panel) => {
            if (panel.urlPath) {
                updateBrowserUrl(panel.urlPath, true);
            }
        });

    }, [sidePanels, updateBrowserUrl, updateSidePanels]);

    return {
        sidePanels,
        close,
        open,
        replace,
        basePath: panelsHistory.current[window.location.pathname]?.baseLocation ?? window.location.pathname,
    };
}
