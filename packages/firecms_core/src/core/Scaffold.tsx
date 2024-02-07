import React, { PropsWithChildren, useCallback } from "react";
import equal from "react-fast-compare"
import { Link } from "react-router-dom";

import { Drawer as DefaultDrawer, DrawerProps } from "./Drawer";
import { useLargeLayout, useNavigationController } from "../hooks";
import { ErrorBoundary, FireCMSAppBar as DefaultFireCMSAppBar, FireCMSAppBarProps, FireCMSLogo } from "../components";
import { ChevronLeftIcon, cn, defaultBorderMixin, IconButton, MenuIcon, Sheet, Tooltip } from "@firecms/ui";

export const DRAWER_WIDTH = 280;

/**
 * @group Core
 */
export interface ScaffoldProps<ExtraDrawerProps = object, ExtraAppbarProps = object> {

    /**
     * Name of the app, displayed as the main title and in the tab title
     */
    name: string;

    /**
     * Logo to be displayed in the drawer of the CMS
     */
    logo?: string;

    /**
     * Whether to include the drawer in the scaffold
     */
    includeDrawer?: boolean;

    /**
     * In case you need to override the view that gets rendered as a drawer
     * @see DefaultDrawer
     */
    Drawer?: React.ComponentType<DrawerProps<ExtraDrawerProps>>;

    /**
     * Additional props passed to the custom Drawer
     */
    drawerProps?: Partial<DrawerProps> & ExtraDrawerProps;

    /**
     * Open the drawer on hover
     */
    autoOpenDrawer?: boolean;

    /**
     * A component that gets rendered on the upper side of the main toolbar.
     * `toolbarExtraWidget` has no effect if this is set.
     */
    FireCMSAppBar?: React.ComponentType<FireCMSAppBarProps<ExtraAppbarProps>>;

    /**
     * Additional props passed to the custom AppBar
     */
    fireCMSAppBarProps?: Partial<FireCMSAppBarProps> & ExtraAppbarProps;

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
 * @group Core
 */
export const Scaffold = React.memo<PropsWithChildren<ScaffoldProps>>(
    function Scaffold(props: PropsWithChildren<ScaffoldProps>) {

        const {
            children,
            name,
            logo,
            includeDrawer = true,
            autoOpenDrawer,
            Drawer = DefaultDrawer,
            drawerProps,
            FireCMSAppBar = DefaultFireCMSAppBar,
            fireCMSAppBarProps,
        } = props;

        const largeLayout = useLargeLayout();

        const [drawerOpen, setDrawerOpen] = React.useState(false);
        const [onHover, setOnHover] = React.useState(false);

        const setOnHoverTrue = useCallback(() => setOnHover(true), []);
        const setOnHoverFalse = useCallback(() => setOnHover(false), []);

        const handleDrawerClose = useCallback(() => {
            setDrawerOpen(false);
        }, []);

        const computedDrawerOpen: boolean = drawerOpen || Boolean(largeLayout && autoOpenDrawer && onHover);
        return (
            <div
                className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden"
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

                <FireCMSAppBar title={name}
                                        includeDrawer={includeDrawer}
                                        drawerOpen={computedDrawerOpen}
                                        {...fireCMSAppBarProps}/>

                <StyledDrawer
                    displayed={includeDrawer}
                    onMouseEnter={setOnHoverTrue}
                    onMouseMove={setOnHoverTrue}
                    onMouseLeave={setOnHoverFalse}
                    open={computedDrawerOpen}
                    logo={logo}
                    hovered={onHover}
                    setDrawerOpen={setDrawerOpen}>
                    {includeDrawer && (
                        <Drawer
                            hovered={onHover}
                            drawerOpen={computedDrawerOpen}
                            closeDrawer={handleDrawerClose}
                            {...drawerProps}/>)}
                </StyledDrawer>

                <main
                    className="flex flex-col flex-grow overflow-auto">
                    <DrawerHeader/>
                    <div
                        className={cn(defaultBorderMixin, "flex-grow overflow-auto lg:m-0 lg:mx-4 lg:mb-4 lg:rounded-lg lg:border lg:border-solid m-0 mt-1")}>

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
    displayed: boolean,
    open: boolean,
    logo?: string,
    hovered: boolean,
    setDrawerOpen: (open: boolean) => void,
    onMouseEnter: () => void,
    onMouseMove: () => void,
    onMouseLeave: () => void
}) {

    const navigation = useNavigationController();

    const width = !props.displayed ? 0 : (props.open ? DRAWER_WIDTH : 72);
    const innerDrawer = <div
        className={"relative h-full no-scrollbar overflow-y-auto overflow-x-hidden"}
        style={{
            width,
            transition: "left 150ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, opacity 150ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, width 150ms cubic-bezier(0.4, 0, 0.6, 1) 0ms"
        }}
    >

        {!props.open && props.displayed && (
            <Tooltip title="Open menu"
                     side="right"
                     sideOffset={12}
                     className="fixed top-2 left-3 !bg-gray-50 dark:!bg-gray-900 rounded-full w-fit"
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

        <div className={"flex flex-col h-full"}>
            <div
                style={{
                    transition: "padding 150ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
                    padding: props.open ? "32px 96px 0px 24px" : "72px 16px 0px"
                }}
                className={cn("cursor-pointer")}>

                <Tooltip title={"Home"}
                         sideOffset={20}
                         side="right">
                    <Link
                        to={navigation.basePath}>
                        {props.logo
                            ? <img src={props.logo}
                                   alt="Logo"
                                   className={cn("max-w-full max-h-full",
                                       props.open ?? "w-[160px] h-[160px]")}/>
                            : <FireCMSLogo/>}

                    </Link>
                </Tooltip>
            </div>

            {props.children}
        </div>

    </div>;

    const largeLayout = useLargeLayout();
    if (!largeLayout) {
        if (!props.displayed)
            return null;
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
    }

    return (
        <div
            className="relative"
            onMouseEnter={props.onMouseEnter}
            onMouseMove={props.onMouseMove}
            onMouseLeave={props.onMouseLeave}
            style={{
                width,
                transition: "left 150ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, opacity 150ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, width 150ms cubic-bezier(0.4, 0, 0.6, 1) 0ms"
            }}>

            {innerDrawer}

            <div
                className={`absolute right-0 top-4 ${
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
