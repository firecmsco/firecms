import React, { PropsWithChildren, useCallback } from "react";
import equal from "react-fast-compare"
import { Link } from "react-router-dom";
import clsx from "clsx";

import { Drawer as FireCMSDrawer, DrawerProps } from "./Drawer";
import { useNavigationContext } from "../hooks";
import { CircularProgressCenter, ErrorBoundary, FireCMSAppBar, FireCMSAppBarProps, FireCMSLogo } from "./components";
import { useRestoreScroll } from "./internal/useRestoreScroll";
import { IconButton, Sheet, Tooltip } from "../components";
import { useLargeLayout } from "../hooks/useLargeLayout";
import { MenuIcon, ChevronLeftIcon } from "../icons";

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

    /**
     * A component that gets rendered on the upper side of the main toolbar.
     * `toolbarExtraWidget` has no effect if this is set.
     */
    FireCMSAppBarComponent?: React.ComponentType<FireCMSAppBarProps>;

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
            autoOpenDrawer,
            FireCMSAppBarComponent = FireCMSAppBar
        } = props;

        const largeLayout = useLargeLayout();

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

        const computedDrawerOpen: boolean = drawerOpen || Boolean(largeLayout && autoOpenDrawer && onHover);
        return (
            <div
                className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                style={{
                    paddingTop: "env(safe-area-inset-top)",
                    paddingLeft: "env(safe-area-inset-left)",
                    paddingRight: "env(safe-area-inset-right)",
                    paddingBottom: "env(safe-area-inset-bottom)",
                    height: "100dvh"
                    // "@supports (height: 100dvh)": {
                    //     height: "100dvh"
                    // }
                }}>

                <FireCMSAppBarComponent title={name}
                                        drawerOpen={computedDrawerOpen}>
                    {toolbarExtraWidget}
                </FireCMSAppBarComponent>

                <StyledDrawer
                    onMouseEnter={setOnHoverTrue}
                    onMouseMove={setOnHoverTrue}
                    onMouseLeave={setOnHoverFalse}
                    open={computedDrawerOpen}
                    logo={logo}
                    hovered={autoOpenDrawer ? onHover : false}
                    setDrawerOpen={setDrawerOpen}>
                    {navigation.loading
                        ? <CircularProgressCenter/>
                        : <UsedDrawer
                            hovered={onHover}
                            drawerOpen={computedDrawerOpen}
                            closeDrawer={handleDrawerClose}/>}
                </StyledDrawer>

                <main
                    className="flex flex-col flex-grow overflow-auto">
                    <DrawerHeader/>
                    <div
                        ref={containerRef}
                        className={"flex-grow overflow-auto lg:m-0 lg:mx-4 lg:mb-4 lg:rounded-lg lg:border lg:border-solid lg:border-gray-100 lg:dark:border-gray-800 m-0 mt-1"}>

                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>

                    </div>
                </main>
            </div>
        );
    },
    equal
)

const DrawerHeader = () => {
    return (
        <div className="flex flex-col min-h-[68px]"></div>
    );
};

function StyledDrawer(props: {
    children: React.ReactNode,
    open: boolean,
    logo?: string,
    hovered: boolean,
    setDrawerOpen: (open: boolean) => void,
    onMouseEnter: () => void,
    onMouseMove: () => void,
    onMouseLeave: () => void
}) {

    const navigation = useNavigationContext();

    const innerDrawer = <div
        className={"relative left-0 top-0 h-full overflow-auto no-scrollbar"}
        style={{
            width: props.open ? DRAWER_WIDTH : "72px",
            transition: "left 200ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, opacity 200ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, width 200ms cubic-bezier(0.4, 0, 0.6, 1) 0ms"
        }}
    >

        {!props.open && (
            <Tooltip title="Open menu"
                     placement="right"
                     className="absolute top-2 left-3 !bg-gray-50 dark:!bg-gray-900 rounded-full w-fit"
            >
                <IconButton
                    color="inherit"
                    aria-label="Open menu"
                    className="sticky top-2 left-3 "
                    onClick={() => props.setDrawerOpen(true)}
                    size="large"
                >
                    <MenuIcon/>
                </IconButton>
            </Tooltip>
        )}

        <div
            style={{
                transition: "padding 200ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
                padding: props.open ? "32px 96px 0px 24px" : "72px 16px 0px"
            }}
            className={clsx("cursor-pointer")}>

            <Tooltip title={props.open ? "" : "Home"} placement="right">
                <Link
                    to={navigation.basePath}>
                    {props.logo
                        ? <img src={props.logo}
                               alt="Logo"
                               className="max-w-full max-h-full"/>
                        : <FireCMSLogo/>}

                </Link>
            </Tooltip>
        </div>

        {props.children}

    </div>;

    const largeLayout = useLargeLayout();
    if (!largeLayout)
        return <>
            <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={() => props.setDrawerOpen(true)}
                size="large"
                className="absolute top-2 left-6"
            >
                <MenuIcon/>
            </IconButton>
            <Sheet side={"left"}
                   transparent={true}
                   open={props.open}
                   onOpenChange={props.setDrawerOpen}
            >
                {innerDrawer}
            </Sheet>
        </>;

    return (
        <div
            className="relative"
            onMouseEnter={props.onMouseEnter}
            onMouseMove={props.onMouseMove}
            onMouseLeave={props.onMouseLeave}
            style={{
                width: props.open ? DRAWER_WIDTH : "72px"
            }}>

            {innerDrawer}

            <div
                className={`absolute right-4 top-4 ${
                    props.open ? "opacity-100" : "opacity-0 invisible"
                } transition-opacity duration-1000 ease-in-out`}>
                <IconButton
                    aria-label="Close drawer"
                    onClick={() => props.setDrawerOpen(false)}
                >
                    <ChevronLeftIcon/>
                </IconButton>
            </div>

        </div>
    );
}
