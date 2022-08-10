import React, { PropsWithChildren, useCallback, useEffect } from "react";

import { Box, Drawer as MuiDrawer, Link, useTheme } from "@mui/material";
import { Drawer as FireCMSDrawer, DrawerProps } from "./Drawer";
import { NavLink, useLocation } from "react-router-dom";
import { useNavigationContext } from "../hooks";
import { CircularProgressCenter, FireCMSLogo } from "./components";
import { CSSObject, styled, Theme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { FireCMSAppBar } from "./internal/FireCMSAppBar";

export const DRAWER_WIDTH = 280;

/**
 * @category Core
 */
export interface ScaffoldProps<ExtraDrawerProps = {}> {

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
    Drawer?: React.ComponentType<DrawerProps<ExtraDrawerProps>>;

    /**
     * Additional props passed to the custom Drawer
     */
    drawerProps?: ExtraDrawerProps;

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

export const Scaffold = React.memo<PropsWithChildren<ScaffoldProps>>(
    function Scaffold(props: PropsWithChildren<ScaffoldProps>) {

        const {
            children,
            name,
            logo,
            toolbarExtraWidget,
            Drawer
        } = props;

        const navigation = useNavigationContext();
        const containerRef = useRestoreScroll();

        const [drawerOpen, setDrawerOpen] = React.useState(false);

        const theme = useTheme();

        const UsedDrawer = Drawer || FireCMSDrawer;

        const handleDrawerOpen = useCallback(() => {
            setDrawerOpen(true);
        }, []);

        const handleDrawerClose = useCallback(() => {
            setDrawerOpen(false);
        }, []);

        let logoComponent;
        if (logo) {
            logoComponent = <img
                style={{
                    maxWidth: "100%",
                    maxHeight: "100%"
                }}
                src={logo}
                alt={"Logo"}/>;
        } else {
            logoComponent = <FireCMSLogo/>;
        }

        return (
            <Box sx={{ display: "flex", height: "100vh" }}>

                <FireCMSAppBar title={name}
                               drawerOpen={drawerOpen}
                               handleDrawerOpen={handleDrawerOpen}
                               toolbarExtraWidget={toolbarExtraWidget}/>

                <StyledDrawer variant="permanent" open={drawerOpen}>

                    <DrawerHeader>
                        {drawerOpen && <Link
                            key={"breadcrumb-home"}
                            color="inherit"
                            onClick={handleDrawerClose}
                            component={NavLink}
                            to={navigation.homeUrl}>

                            {logoComponent}

                        </Link>}
                    </DrawerHeader>

                    {drawerOpen && <IconButton onClick={handleDrawerClose}
                                               sx={{
                                                   position: "absolute",
                                                   right: 8,
                                                   top: 16
                                               }}>
                        {theme.direction === "rtl"
                            ? <ChevronRightIcon/>
                            : <ChevronLeftIcon/>}
                    </IconButton>}

                    <nav>
                        {navigation.loading
                            ? <CircularProgressCenter/>
                            : <UsedDrawer
                                logo={logo}
                                drawerOpen={drawerOpen}
                                closeDrawer={handleDrawerClose}/>}
                    </nav>
                </StyledDrawer>

                <Box component={"main"}
                     sx={{
                         display: "flex",
                         flexDirection: "column",
                         flexGrow: 1,
                         width: "100%",
                         height: "100%",
                         overflow: "auto"
                     }}>
                    <DrawerHeader/>
                    <Box
                        sx={{
                            flexGrow: 1,
                            height: "100%",
                            m: 2,
                            overflow: "hidden",
                            borderRadius: "12px",
                            border: `1px solid ${theme.palette.divider}`
                        }}>
                        <Box
                            ref={containerRef}
                            sx={{
                                height: "100%",
                                overflow: "scroll",
                            }}>
                            {children}
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    },
    function areEqual(prevProps: PropsWithChildren<ScaffoldProps>, nextProps: PropsWithChildren<ScaffoldProps>) {
        return prevProps.name === nextProps.name &&
            prevProps.logo === nextProps.logo;
    }
)

function useRestoreScroll() {

    const scrollsMap = React.useRef<Record<string, number>>({});

    const location = useLocation();

    const containerRef = React.createRef<HTMLDivElement>();

    const handleScroll = () => {
        if (!containerRef.current || !location.key) return;
        scrollsMap.current[location.key] = containerRef.current.scrollTop;
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            if (container)
                container.removeEventListener("scroll", handleScroll);
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

const DrawerHeader = styled("div")(({ theme }) => ({
    // display: "flex",
    // alignItems: "center",
    // justifyContent: "flex-end",
    padding: theme.spacing(4, 12, 1, 3),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
}));

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
    ({ theme, open }) => ({
        width: DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        border: "none",
        ...(open && {
            ...openedMixin(theme),
            "& .MuiDrawer-paper": openedMixin(theme)
        }),
        ...(!open && {
            ...closedMixin(theme),
            "& .MuiDrawer-paper": closedMixin(theme)
        })
    })
);

const openedMixin = (theme: Theme): CSSObject => ({
    willChange: "width",
    width: DRAWER_WIDTH,
    border: "none",
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
    }),
    backgroundColor: theme.palette.background.default,
    overflowX: "hidden"
});

const closedMixin = (theme: Theme): CSSObject => ({
    willChange: "width",
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    }),
    border: "none",
    overflowX: "hidden",
    backgroundColor: theme.palette.background.default,
    width: `calc(${theme.spacing(8)})`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(9)})`
    }
});
