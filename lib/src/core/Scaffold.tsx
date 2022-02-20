import React, { PropsWithChildren, useEffect } from "react";

import { Box, Drawer as MuiDrawer } from "@mui/material";
import { Drawer as FireCMSDrawer, DrawerProps } from "./Drawer";
import { FireCMSAppBar } from "./internal/FireCMSAppBar";
import { useLocation } from "react-router-dom";
import { useNavigation } from "../hooks";
import { CircularProgressCenter } from "./components";


/**
 * @category Core
 */
export interface ScaffoldProps {

    /**
     * Name of the app, displayed as the main title and in the tab title
     */
    name: string;

    /**
     * Logo to be displayed in the drawer of the CMS
     */
    logo?: string;

    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;

    /**
     * In case you need to override the view that gets rendered as a drawer
     * @see FireCMSDrawer
     */
    Drawer?: React.ComponentType<DrawerProps>;

}

/**
 * This view acts as a scaffold for FireCMS.
 *
 * It is in charge of displaying the navigation drawer, top bar and main
 * collection views.
 * This component needs a parent {@link FireCMS}
 *
 * @param props
 * @constructor
 * @category Core
 */
export function Scaffold(props: PropsWithChildren<ScaffoldProps>) {

    const {
        children,
        name,
        logo,
        toolbarExtraWidget,
        Drawer
    } = props;



    const navigationContext = useNavigation();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const containerRef = useRestoreScroll();

    const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
    const closeDrawer = () => setDrawerOpen(false);

    const UsedDrawer = Drawer || FireCMSDrawer;

    return (
        (<>
            <nav>
                <MuiDrawer
                    variant="temporary"
                    anchor={"left"}
                    open={drawerOpen}
                    onClose={closeDrawer}
                    sx={{
                        width: 280
                    }}
                    ModalProps={{
                        keepMounted: true
                    }}
                >
                    {!navigationContext.navigation
                        ? <CircularProgressCenter/>
                        : <UsedDrawer logo={logo} closeDrawer={closeDrawer}/>}

                </MuiDrawer>
            </nav>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                width: "100vw",
                height: "100vh"
            }}>

                <FireCMSAppBar title={name}
                               handleDrawerToggle={handleDrawerToggle}
                               toolbarExtraWidget={toolbarExtraWidget}/>
                <Box component={"main"}
                     sx={{
                         flexGrow: 1,
                         width: "100%",
                         height: "100%",
                         overflow: "auto"
                     }}
                     ref={containerRef}>
                    {children}
                </Box>
            </Box>
        </>)
    );


}

function useRestoreScroll() {

    const scrollsMap = React.useRef<Record<string, number>>({});

    const location = useLocation();

    const containerRef = React.createRef<HTMLDivElement>();

    const handleScroll = () => {
        if (!containerRef.current || !location.key) return;
        scrollsMap.current[location.key] = containerRef.current.scrollTop;
    };

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            if (containerRef.current)
                containerRef.current.removeEventListener('scroll', handleScroll);
        };
    }, [containerRef, location]);

    useEffect(() => {
        if (!containerRef.current || !scrollsMap.current || !scrollsMap.current[location.key]) return;
        containerRef.current.scrollTo(
            {
                top: scrollsMap.current[location.key],
                behavior: "auto"
            });
    }, [location]);

    return containerRef;
}

