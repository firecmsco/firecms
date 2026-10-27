import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SideDialogPanelProps, SideDialogsController } from "../types";
import equal from "react-fast-compare"

export function useBuildSideDialogsController(): SideDialogsController {

    const location = useLocation();
    const navigate = useNavigate();

    const [sidePanels, setSidePanels] = useState<SideDialogPanelProps[]>([]);
    const sidePanelsRef = useRef<SideDialogPanelProps[]>(sidePanels);

    const routesStore = useRef<Record<string, SideDialogPanelProps>>({});
    const routesCount = useRef<number>(0);

    // The history entry each panel without a URL was opened on, by panel key.
    const entryKeysOfPanelsWithoutUrl = useRef<Record<string, string>>({});

    const updateSidePanels = (newPanels: SideDialogPanelProps[]) => {
        sidePanelsRef.current = newPanels;
        setSidePanels(newPanels);
    };

    useEffect(() => {
        const state = location.state as any;
        const panelKeys: string[] = state?.panels ?? [];
        const panelsInHistory = panelKeys
            .map(key => routesStore.current[key])
            .filter(p => Boolean(p)) as SideDialogPanelProps[];

        // A panel without a URL, like a reference dialog, pushes no history entry, so the
        // entry under it does not list it, and going back to that entry, as closing a
        // panel opened on top of it does, would drop it. It stays open for as long as
        // what it was opened over does: the panel below it or, with none, the entry itself.
        const keptPanels: SideDialogPanelProps[] = [];
        let matched = 0;
        for (const panel of sidePanelsRef.current) {
            if (panelsInHistory[matched]?.key === panel.key) {
                keptPanels.push(panel);
                matched++;
            } else if (!panel.urlPath &&
                (keptPanels.length > 0 || entryKeysOfPanelsWithoutUrl.current[panel.key] === location.key)) {
                keptPanels.push(panel);
            } else {
                break;
            }
        }
        const newPanels = [...keptPanels, ...panelsInHistory.slice(matched)];

        if (!equal(sidePanelsRef.current.map(p => p.key), newPanels.map(p => p.key))) {
            updateSidePanels(newPanels);
        }
    }, [location]);

    const close = useCallback((key?: string) => {

        const currentPanels = sidePanelsRef.current;
        if (currentPanels.length === 0)
            return;

        // A panel can ask to close itself while another one is open on top of it: the
        // reference dialog does when an entity created from it is saved. Closing the top
        // one instead would close that entity, and then the entity's own close would take
        // the panel under the dialog with it. Only a panel without a URL can be taken out
        // of the middle, since it has no history entry of its own. Should two panels share
        // a key (a reference dialog opened from an entity created in another one for the
        // same collection), it is the upper one.
        const index = key !== undefined ? currentPanels.findLastIndex(p => p.key === key) : -1;
        if (index !== -1 && index < currentPanels.length - 1 && !currentPanels[index].urlPath) {
            updateSidePanels(currentPanels.filter((_, i) => i !== index));
            if (routesCount.current > 0)
                routesCount.current--;
            return;
        }

        const lastSidePanel = currentPanels[currentPanels.length - 1];
        const updatedPanels = [...currentPanels.slice(0, -1)];
        updateSidePanels(updatedPanels);

        if (routesCount.current > 0) {
            if (lastSidePanel.urlPath) // if it has a url path, we need to navigate back, don't remove this code
                navigate(-1);
            routesCount.current--;
        } else if (lastSidePanel.parentUrlPath) {
            const baseLocation = (location.state as any)?.base_location ?? location;
            navigate(
                lastSidePanel.parentUrlPath,
                {
                    replace: true,
                    state: {
                        base_location: baseLocation,
                        panels: updatedPanels.map(p => p.key)
                    }
                }
            );
        }
    }, [navigate, location]);

    const open = useCallback((panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => {

        const newPanels: SideDialogPanelProps[] = Array.isArray(panelProps) ? panelProps : [panelProps];

        newPanels.forEach((panel) => {
            routesStore.current[panel.key] = panel;
            if (!panel.urlPath)
                entryKeysOfPanelsWithoutUrl.current[panel.key] = location.key;
        });
        routesCount.current = routesCount.current + newPanels.length;

        const baseLocation = (location.state as any)?.base_location ?? location;

        const currentPanels = sidePanelsRef.current;
        const updatedPanels = [...currentPanels, ...newPanels];
        updateSidePanels(updatedPanels);

        newPanels.forEach((panel) => {
            if (panel.urlPath) {
                navigate(
                    panel.urlPath,
                    {
                        state: {
                            base_location: baseLocation,
                            panels: updatedPanels.map(p => p.key)
                        }
                    }
                );
            }
        });

    }, [location, navigate]);

    const replace = useCallback((panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => {

        const newPanels: SideDialogPanelProps[] = Array.isArray(panelProps) ? panelProps : [panelProps];
        newPanels.forEach((panel) => {
            routesStore.current[panel.key] = panel;
            if (!panel.urlPath)
                entryKeysOfPanelsWithoutUrl.current[panel.key] = location.key;
        });

        const baseLocation = (location.state as any)?.base_location ?? location;

        const currentPanels = sidePanelsRef.current;
        const updatedPanels = [...currentPanels.slice(0, -newPanels.length), ...newPanels];
        updateSidePanels(updatedPanels);

        newPanels.forEach((panel) => {
            if (panel.urlPath) {
                navigate(
                    panel.urlPath,
                    {
                        replace: true,
                        state: {
                            base_location: baseLocation,
                            panels: updatedPanels.map(p => p.key)
                        }
                    }
                );
            }
        });

    }, [location, navigate]);

    return {
        sidePanels,
        setSidePanels: updateSidePanels,
        close,
        open,
        replace
    };
}
