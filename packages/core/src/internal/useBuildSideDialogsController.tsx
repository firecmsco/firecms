import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SideDialogPanelProps, SideDialogsController } from "@rebasepro/types";
import { deepEqual as equal } from "fast-equals"
import { Location } from "react-router-dom";

interface SideDialogLocationState {
    base_location?: Location;
    panels?: string[];
}

export function useBuildSideDialogsController(): SideDialogsController {

    const location = useLocation();
    const navigate = useNavigate();

    const [sidePanels, setSidePanels] = useState<SideDialogPanelProps[]>([]);
    const sidePanelsRef = useRef<SideDialogPanelProps[]>(sidePanels);

    const routesStore = useRef<Record<string, SideDialogPanelProps>>({});
    const routesCount = useRef<number>(0);

    const updateSidePanels = (newPanels: SideDialogPanelProps[]) => {
        sidePanelsRef.current = newPanels;
        setSidePanels(newPanels);
    };

    useEffect(() => {
        const state = location.state as SideDialogLocationState | null;
        const panelKeys: string[] = state?.panels ?? [];
        const newPanels = panelKeys
            .map(key => routesStore.current[key])
            .filter(p => Boolean(p)) as SideDialogPanelProps[];
        if (!equal(sidePanelsRef.current.map(p => p.key), newPanels.map(p => p.key))) {
            updateSidePanels(newPanels);
            // If all panels were cleared via explicit navigation (full-screen expand),
            // reset routesCount so close() doesn't fire navigate(-1)
            if (newPanels.length === 0) {
                routesCount.current = 0;
            }
        }
    }, [location]);

    const close = useCallback(() => {

        const currentPanels = sidePanelsRef.current;
        if (currentPanels.length === 0)
            return;

        const lastSidePanel = currentPanels[currentPanels.length - 1];
        const updatedPanels = [...currentPanels.slice(0, -1)];
        updateSidePanels(updatedPanels);

        if (routesCount.current > 0) {
            if (lastSidePanel.urlPath) // if it has a url path, we need to navigate back, don't remove this code
                navigate(-1);
            routesCount.current--;
        } else if (lastSidePanel.parentUrlPath) {
            const baseLocation = (location.state as SideDialogLocationState | null)?.base_location ?? location;
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
        });
        routesCount.current = routesCount.current + newPanels.length;

        const baseLocation = (location.state as SideDialogLocationState | null)?.base_location ?? location;

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
        });

        const baseLocation = (location.state as SideDialogLocationState | null)?.base_location ?? location;

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
