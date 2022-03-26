import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SideDialogPanelProps, SideDialogsController } from "../SideDialogs";

export function useBuildSideDialogsController(): SideDialogsController {

    const location = useLocation();
    const navigate = useNavigate();

    const [sidePanels, setSidePanels] = useState<SideDialogPanelProps[]>([]);
    const routesStore = useRef<Record<string, SideDialogPanelProps>>({});
    const routesCount = useRef<number>(0);

    useEffect(() => {
        const state = location.state as any;
        const panelKeys: string[] | undefined = state?.panels;
        setSidePanels((panelKeys ?? [])
            .map(key => routesStore.current[key])
            .filter(p => Boolean(p)) as SideDialogPanelProps[]
        );
    }, [location]);

    const close = useCallback(() => {

        if (sidePanels.length === 0)
            return;

        const lastSidePanel = sidePanels[sidePanels.length - 1];
        const updatedPanels = [...sidePanels.slice(0, -1)];
        setSidePanels(updatedPanels);

        if (routesCount.current > 0) {
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
    }, [sidePanels, location, routesCount]);

    const open = (props: SideDialogPanelProps) => {

        routesStore.current[props.key] = props;
        routesCount.current++;

        const baseLocation = (location.state as any)?.base_location ?? location;

        const updatedPanels = [...sidePanels, props];
        setSidePanels(updatedPanels);

        if (props.urlPath) {
            navigate(
                props.urlPath,
                {
                    state: {
                        base_location: baseLocation,
                        panels: updatedPanels.map(p => p.key)
                    }
                }
            );
        }
    };

    const replace = (props: SideDialogPanelProps) => {

        routesStore.current[props.key] = props;

        const baseLocation = (location.state as any)?.base_location ?? location;

        const updatedPanels = [...sidePanels.slice(0, -1), props];
        setSidePanels(updatedPanels);

        if (props.urlPath) {
            navigate(
                props.urlPath,
                {
                    replace: true,
                    state: {
                        base_location: baseLocation,
                        panels: updatedPanels.map(p => p.key)
                    }
                }
            );
        }

    };

    return {
        sidePanels,
        close,
        open,
        replace
    };
}
