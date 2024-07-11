import React, { PropsWithChildren, useCallback } from "react";
import { ChevronLeftIcon, cls, defaultBorderMixin, IconButton, MenuIcon, Sheet, Tooltip } from "@firecms/ui";
import equal from "react-fast-compare"
import { useLargeLayout } from "../hooks";
import { ErrorBoundary } from "../components";
import { AppContext } from "./useApp";

export const DRAWER_WIDTH = 280;

/**
 * @group Core
 */
export interface ScaffoldProps {

    /**
     * Open the drawer on hover
     */
    autoOpenDrawer?: boolean;

    /**
     * Logo to be displayed in the top bar and drawer.
     * Note that this has no effect if you are using a custom AppBar or Drawer.
     */
    logo?: string;

    className?: string;

    style?: React.CSSProperties;
}

/**
 * This view acts as a scaffold for FireCMS.
 *
 * It is in charge of displaying the navigation drawer, top bar and main
 * collection views.
 * This component needs a parent {@link FireCMS}
 *
 * @param props

 * @group Core
 */
export const Scaffold = React.memo<PropsWithChildren<ScaffoldProps>>(
    function Scaffold(props: PropsWithChildren<ScaffoldProps>) {

        const {
            children,
            autoOpenDrawer,
            logo,
            className,
            style
        } = props;

        const drawerChildren = React.Children.toArray(children).filter((child: any) => child.type.componentType === "Drawer");
        if (drawerChildren.length > 1) {
            throw Error("Only one Drawer component is allowed in Scaffold");
        }
        const appBarChildren = React.Children.toArray(children).filter((child: any) => child.type.componentType === "AppBar");
        if (appBarChildren.length > 1) {
            throw Error("Only one AppBar component is allowed in Scaffold");
        }
        const otherChildren = React.Children.toArray(children)
            .filter((child: any) => child.type.componentType !== "Drawer" && child.type.componentType !== "AppBar");
        const includeDrawer = drawerChildren.length > 0;
        const largeLayout = useLargeLayout();

        const [drawerOpen, setDrawerOpen] = React.useState(false);
        const [onHover, setOnHover] = React.useState(false);

        const setOnHoverTrue = useCallback(() => setOnHover(true), []);
        const setOnHoverFalse = useCallback(() => setOnHover(false), []);

        const handleDrawerOpen = useCallback(() => {
            setDrawerOpen(true);
        }, []);

        const handleDrawerClose = useCallback(() => {
            setDrawerOpen(false);
        }, []);

        const computedDrawerOpen: boolean = drawerOpen || Boolean(largeLayout && autoOpenDrawer && onHover);

        return (
            <AppContext.Provider value={{
                logo,
                hasDrawer: includeDrawer,
                drawerHovered: onHover,
                drawerOpen: computedDrawerOpen,
                closeDrawer: handleDrawerClose,
                openDrawer: handleDrawerOpen,
                autoOpenDrawer
            }}>
                <div
                    className={cls("flex h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden", className)}
                    style={{
                        paddingTop: "env(safe-area-inset-top)",
                        paddingLeft: "env(safe-area-inset-left)",
                        paddingRight: "env(safe-area-inset-right)",
                        paddingBottom: "env(safe-area-inset-bottom)",
                        height: "100dvh",
                        ...style
                    }}>

                    {appBarChildren}

                    <DrawerWrapper
                        displayed={includeDrawer}
                        onMouseEnter={setOnHoverTrue}
                        onMouseMove={setOnHoverTrue}
                        onMouseLeave={setOnHoverFalse}
                        open={computedDrawerOpen}
                        hovered={onHover}
                        setDrawerOpen={setDrawerOpen}>
                        {includeDrawer && drawerChildren}
                    </DrawerWrapper>

                    <main
                        className="flex flex-col flex-grow overflow-auto">
                        <DrawerHeader/>
                        <div
                            className={cls(defaultBorderMixin, "flex-grow overflow-auto lg:m-0 lg:mx-4 lg:mb-4 lg:rounded-lg lg:border lg:border-solid m-0 mt-1")}>

                            <ErrorBoundary>
                                {otherChildren}
                            </ErrorBoundary>

                        </div>
                    </main>
                </div>
            </AppContext.Provider>
        );
    },
    equal
)

const DrawerHeader = () => {
    return (
        <div className="flex flex-col min-h-[68px]"></div>
    );
};

function DrawerWrapper(props: {
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

    const width = !props.displayed ? 0 : (props.open ? DRAWER_WIDTH : 72);
    const innerDrawer = <div
        className={"relative h-full no-scrollbar overflow-y-auto overflow-x-hidden"}
        style={{
            width,
            transition: "left 100ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, opacity 100ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, width 100ms cubic-bezier(0.4, 0, 0.6, 1) 0ms"
        }}
    >

        {!props.open && props.displayed && (
            <Tooltip title="Open menu"
                     side="right"
                     sideOffset={12}
                     className="fixed top-2 left-3 !bg-gray-50 dark:!bg-gray-900 rounded-full w-fit z-20"
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
            className={`z-20 absolute right-0 top-4 ${
                props.open ? "opacity-100" : "opacity-0 invisible"
            } transition-opacity duration-200 ease-in-out`}>
            <IconButton
                aria-label="Close drawer"
                onClick={() => props.setDrawerOpen(false)}
            >
                <ChevronLeftIcon/>
            </IconButton>
        </div>

        <div className={"flex flex-col h-full"}>
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
            className="z-20 relative"
            onMouseEnter={props.onMouseEnter}
            onMouseMove={props.onMouseMove}
            onMouseLeave={props.onMouseLeave}
            style={{
                width,
                transition: "left 100ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, opacity 100ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, width 100ms cubic-bezier(0.4, 0, 0.6, 1) 0ms"
            }}>

            {innerDrawer}

            {/*<div*/}
            {/*    className={`z-20 absolute right-0 top-4 ${*/}
            {/*        props.open ? "opacity-100" : "opacity-0 invisible"*/}
            {/*    } transition-opacity duration-1000 ease-in-out`}>*/}
            {/*    <IconButton*/}
            {/*        aria-label="Close drawer"*/}
            {/*        onClick={() => props.setDrawerOpen(false)}*/}
            {/*    >*/}
            {/*        <ChevronLeftIcon/>*/}
            {/*    </IconButton>*/}
            {/*</div>*/}

        </div>
    );
}
