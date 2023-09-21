import React from "react";

import { Link as ReactLink } from "react-router-dom";
import { ErrorBoundary, } from "../components";
import { Avatar, cn, IconButton, Menu, MenuItem, Typography } from "../../components";
import { useAuthController, useLargeLayout, useModeController, useNavigationContext } from "../../hooks";
import { DarkModeIcon, LightModeIcon, LogoutIcon } from "../../icons";
import { Skeleton } from "../../components/Skeleton";

export type FireCMSAppBarProps<ADDITIONAL_PROPS = object> = {
    title: string;
    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    endAdornment?: React.ReactNode;

    startAdornment?: React.ReactNode;

    dropDownActions?: React.ReactNode;

    includeDrawer?: boolean;

    drawerOpen: boolean;

    className?: string;

    style?: React.CSSProperties;
} & ADDITIONAL_PROPS;

/**
 * This component renders the main app bar of FireCMS.
 * You will likely not need to use this component directly.
 *
 * @param title
 * @param toolbarExtraWidget
 * @param drawerOpen
 * @constructor
 */
export const FireCMSAppBar = function FireCMSAppBar({
                                                        title,
                                                        endAdornment,
                                                        startAdornment,
                                                        drawerOpen,
                                                        dropDownActions,
                                                        includeDrawer,
                                                        className,
                                                        style
                                                    }: FireCMSAppBarProps) {

    const navigation = useNavigationContext();

    const authController = useAuthController();
    const {
        mode,
        toggleMode
    } = useModeController();

    const largeLayout = useLargeLayout();

    let avatarComponent: JSX.Element;
    if (authController.user && authController.user.photoURL) {
        avatarComponent = <Avatar
            src={authController.user.photoURL}/>;
    } else if (authController.user === undefined || authController.initialLoading) {
        avatarComponent = <div className={"p-1 flex justify-center"}>
            <Skeleton className={"w-10 h-10 rounded-full"}/>
        </div>;
    } else {
        const initial = authController.user?.displayName
            ? authController.user.displayName[0].toUpperCase()
            : (authController.user?.email ? authController.user.email[0].toUpperCase() : "A");
        avatarComponent = <Avatar>{initial}</Avatar>;
    }

    return (
        <div
            style={style}
            className={cn("pr-2",
                {
                    "ml-[17rem]": drawerOpen && largeLayout,
                    "ml-16": includeDrawer && !(drawerOpen && largeLayout) && !startAdornment,
                    "h-16": true,
                    "z-10": largeLayout,
                    "transition-all": true,
                    "ease-in": true,
                    "duration-75": true,
                    "w-full": !includeDrawer,
                    "w-[calc(100%-64px)]": includeDrawer && !(drawerOpen && largeLayout),
                    "w-[calc(100%-17rem)]": includeDrawer && (drawerOpen && largeLayout),
                    "duration-150": drawerOpen && largeLayout,
                    fixed: true,
                },
                className)}>

            <div className="flex flex-row gap-2 px-4 h-full items-center">

                {startAdornment}

                <div className="mr-8 hidden lg:block">
                    <ReactLink
                        className="visited:text-inherit visited:dark:text-inherit"
                        to={navigation.basePath ?? "/"}
                    >
                        <Typography variant="subtitle1"
                                    noWrap
                                    className={"ml-2 !font-medium"}>
                            {title}
                        </Typography>
                    </ReactLink>
                </div>

                <div className={"flex-grow"}/>

                {endAdornment &&
                    <ErrorBoundary>
                        {endAdornment}
                    </ErrorBoundary>}

                <IconButton
                    color="inherit"
                    aria-label="Open drawer"
                    onClick={toggleMode}
                    size="large">
                    {mode === "dark"
                        ? <DarkModeIcon/>
                        : <LightModeIcon/>}
                </IconButton>

                <Menu trigger={avatarComponent}>

                    {dropDownActions}

                    {!dropDownActions && <MenuItem onClick={authController.signOut}>
                        <LogoutIcon/>
                        Log Out
                    </MenuItem>}

                </Menu>

            </div>
        </div>
    );
}
