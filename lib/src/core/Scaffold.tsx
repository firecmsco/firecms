import React, { PropsWithChildren, useCallback, useEffect } from "react";
import equal from "react-fast-compare"

import {
    alpha,
    Box,
    Drawer as MuiDrawer,
    DrawerProps as MuiDrawerProps,
    Link,
    Toolbar,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { Drawer as FireCMSDrawer, DrawerProps } from "./Drawer";
import { NavLink, useLocation } from "react-router-dom";
import { useFireCMSContext, useNavigationContext } from "../hooks";
import {
    CircularProgressCenter,
    ErrorBoundary,
    FireCMSLogo
} from "./components";
import { CSSObject, styled, Theme } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { FireCMSAppBar } from "./internal/FireCMSAppBar";
import { useRestoreScroll } from "./internal/useRestoreScroll";

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

    /**
     * Open the drawer on hover
     */
    autoOpenDrawer?: boolean;

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
            Drawer,
            autoOpenDrawer
        } = props;

        const theme = useTheme();
        const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

        const navigation = useNavigationContext();
        const { containerRef } = useRestoreScroll();

        const [drawerOpen, setDrawerOpen] = React.useState(false);
        const [onHover, setOnHover] = React.useState(false);

        const setOnHoverTrue = useCallback(() => setOnHover(true), []);
        const setOnHoverFalse = useCallback(() => setOnHover(false), []);

        const UsedDrawer = Drawer || FireCMSDrawer;

        const handleDrawerClose = useCallback(() => {
            setDrawerOpen(false);
        }, []);

        const computedDrawerOpen:boolean = drawerOpen || Boolean(autoOpenDrawer && onHover);
        return (
            <Box
                sx={{
                    display: "flex",
                    height: "100vh",
                    width: "100vw",
                    pt: "env(safe-area-inset-top)",
                    pl: "env(safe-area-inset-left)",
                    pr: "env(safe-area-inset-right)",
                    pb: "env(safe-area-inset-bottom)"
                }}>

                <FireCMSAppBar title={name}
                               drawerOpen={computedDrawerOpen}
                               toolbarExtraWidget={toolbarExtraWidget}/>

                <StyledDrawer
                    onMouseEnter={setOnHoverTrue}
                    onMouseMove={setOnHoverTrue}
                    onMouseLeave={setOnHoverFalse}
                    open={computedDrawerOpen}
                    logo={logo}
                    hovered={autoOpenDrawer ? onHover : false}
                    setDrawerOpen={setDrawerOpen}>
                    <nav>
                        {navigation.loading
                            ? <CircularProgressCenter/>
                            : <UsedDrawer
                                hovered={onHover}
                                drawerOpen={computedDrawerOpen}
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
                        ref={containerRef}
                        sx={{
                            flexGrow: 1,
                            m: largeLayout ? 2 : 1,
                            borderRadius: "12px",
                            border: `1px solid ${theme.palette.divider}`,
                            height: "100%",
                            overflow: "auto"
                        }}>

                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>

                    </Box>
                </Box>
            </Box>
        );
    },
    equal
)

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    // alignItems: "center",
    // justifyContent: "flex-end",
    // padding: theme.spacing(4, 12, 1, 3),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
}));

function StyledDrawer(props: MuiDrawerProps & {
    logo?: string,
    hovered: boolean,
    setDrawerOpen: (open: boolean) => void,
}) {
    const context = useFireCMSContext();
    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const {
        open,
        logo,
        setDrawerOpen,
        ...drawerProps
    } = props;

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

    const menuIconButton = <IconButton
        color="inherit"
        aria-label="Open drawer"
        edge="start"
        onClick={() => setDrawerOpen(true)}
        size="large"
        sx={{
            position: "absolute",
            top: 8,
            left: 24
        }}>
        <MenuIcon/>
    </IconButton>;

    return <>

        {!largeLayout && menuIconButton}

        <MuiDrawer
            {...drawerProps}
            variant={largeLayout ? "permanent" : "temporary"}
            open={open}
            onClose={!largeLayout ? () => setDrawerOpen(false) : undefined}
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                height: "100%",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
                border: "none",
                ...(open && {
                    ...openedMixin(theme),
                    "& .MuiDrawer-paper": openedMixin(theme)
                }),
                ...(!open && {
                    ...closedMixin(theme, largeLayout),
                    "& .MuiDrawer-paper": closedMixin(theme, largeLayout)
                })
            }}
        >

            <IconButton onClick={() => setDrawerOpen(false)}
                        sx={{
                            position: "absolute",
                            right: 16,
                            top: 16,
                            opacity: open ? 1.0 : 0.0,
                            transition: theme.transitions.create("opacity", {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen
                            })
                        }}>
                {theme.direction === "rtl"
                    ? <ChevronRightIcon/>
                    : <ChevronLeftIcon/>}
            </IconButton>

            <Toolbar sx={{
                position: "absolute",
                left: open ? "-100%" : 0,
                opacity: open ? 0.0 : 1.0,
                transition: theme.transitions.create(["left", "opacity"], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen
                })
            }}>
                {!open
                    ? <Tooltip title={"Open menu"}
                               placement={"right"}>
                        {menuIconButton}
                    </Tooltip>
                    : menuIconButton}
            </Toolbar>

            <Link
                key={"breadcrumb-home"}
                color="inherit"
                component={NavLink}
                to={"."}
                sx={theme => ({
                    transition: theme.transitions.create(["padding"], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen
                    }),
                    p: theme.spacing(
                        open ? 4 : 9,
                        open ? 12 : 2,
                        0,
                        open ? 3 : 2)
                })}>
                <Tooltip title={"Home"} placement={"right"}>
                    <div onClick={() => {
                        context.onAnalyticsEvent?.("drawer_navigate_to_home");
                    }}>
                        {logoComponent}
                    </div>
                </Tooltip>

            </Link>

            {props.children}

            <Link sx={(theme) => ({
                width: DRAWER_WIDTH,
                position: "fixed",
                bottom: 0,
                left: open ? 0 : "-100%",
                opacity: open ? 1.0 : 0.0,
                transition: theme.transitions.create(["left", "opacity"], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen
                }),
                px: "24px",
                py: 1,
                display: "flex",
                alignItems: "center",
                fontWeight: theme.typography.fontWeightMedium,
                background: theme.palette.mode === "light" ? "rgba(255,255,255,0.6)" : alpha(theme.palette.background.paper, 0.1),
                backdropFilter: "blur(8px)"
                // borderTop: `1px solid ${theme.palette.divider}`
            })}
                  href={"https://firecms.co?utm_source=drawer"}
                  onMouseDown={(e: React.MouseEvent) => {
                      e.preventDefault();
                  }}
                  target="_blank">
                <OpenInNewIcon style={{ marginRight: "24px" }}
                               fontSize={"small"}/>
                firecms.co
            </Link>

        </MuiDrawer>
    </>;
}

const openedMixin = (theme: Theme): CSSObject => ({
    willChange: "width",
    pb: "32px",
    width: DRAWER_WIDTH,
    border: "none",
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
    }),
    backgroundColor: theme.palette.background.default,
    overflowX: "hidden"
});

const closedMixin = (theme: Theme, large: boolean): CSSObject => ({
    willChange: "width",
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    }),
    border: "none",
    overflowX: "hidden",
    backgroundColor: theme.palette.background.default,
    width: large ? `calc(${theme.spacing(9)})` : "0px"
});
