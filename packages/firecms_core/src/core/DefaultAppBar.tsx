import React from "react";

import { Link as ReactLink, useNavigate } from "react-router-dom";
import { ErrorBoundary, FireCMSLogo } from "../components";
import {
    Avatar,
    cls,
    DarkModeIcon,
    IconButton,
    LightModeIcon,
    LogoutIcon,
    Menu,
    MenuItem,
    Skeleton,
    Typography
} from "@firecms/ui";
import { useAuthController, useLargeLayout, useModeController, useNavigationController } from "../hooks";
import { User } from "../types";
import { useApp } from "../app/useApp";

export type DefaultAppBarProps<ADDITIONAL_PROPS = object> = {

    title?: React.ReactNode;
    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    endAdornment?: React.ReactNode;

    startAdornment?: React.ReactNode;

    dropDownActions?: React.ReactNode;

    includeModeToggle?: boolean;

    className?: string;

    style?: React.CSSProperties;

    logo?: string;

    user?: User;
} & ADDITIONAL_PROPS;

/**
 * This component renders the main app bar of FireCMS.
 * You will likely not need to use this component directly.
 *

 */
export const DefaultAppBar = function DefaultAppBar({
                                                        title,
                                                        endAdornment,
                                                        startAdornment,
                                                        dropDownActions,
                                                        includeModeToggle = true,
                                                        className,
                                                        style,
                                                        user: userProp
                                                    }: DefaultAppBarProps) {

    const {
        hasDrawer,
        drawerOpen,
        logo
    } = useApp();
    const navigation = useNavigationController();

    const authController = useAuthController();
    const {
        mode,
        toggleMode
    } = useModeController();

    const navigate = useNavigate();

    const largeLayout = useLargeLayout();

    const user = userProp ?? authController.user;

    let avatarComponent: JSX.Element;
    if (user && user.photoURL) {
        avatarComponent = <Avatar
            src={user.photoURL}/>;
    } else if (user === undefined || authController.initialLoading) {
        avatarComponent = <div className={"p-1 flex justify-center"}>
            <Skeleton className={"w-10 h-10 rounded-full"}/>
        </div>;
    } else {
        const initial = user?.displayName
            ? user.displayName[0].toUpperCase()
            : (user?.email ? user.email[0].toUpperCase() : "A");
        avatarComponent = <Avatar>{initial}</Avatar>;
    }

    return (
        <div
            style={style}
            className={cls("w-full h-16 transition-all ease-in duration-75 fixed",
                {
                    "pl-[17rem]": drawerOpen && largeLayout,
                    "pl-20": hasDrawer && !(drawerOpen && largeLayout),
                    "z-10": largeLayout,
                    // "w-full": !hasDrawer,
                    // "w-[calc(100%-64px)]": hasDrawer && !(drawerOpen && largeLayout),
                    // "w-[calc(100%-17rem)]": hasDrawer && (drawerOpen && largeLayout),
                    "duration-150": drawerOpen && largeLayout,
                },
                className)}>

            <div className="flex flex-row gap-2 px-4 h-full items-center">

                {navigation && <div className="mr-8 hidden lg:block">
                    <ReactLink
                        className="visited:text-inherit visited:dark:text-inherit"
                        to={navigation?.basePath ?? "/"}
                    >
                        <div className={"flex flex-row gap-4"}>
                            {!hasDrawer && (logo
                                ? <img src={logo}
                                       alt="Logo"
                                       className={cls("w-[32px] h-[32px] object-contain")}/>
                                : <FireCMSLogo width={"32px"} height={"32px"}/>)}

                            {typeof title === "string"
                                ? <Typography variant="subtitle1"
                                              noWrap
                                              className={cls("!font-medium", drawerOpen ? "ml-2" : "")}>
                                    {title}
                                </Typography>
                                : title}
                        </div>
                    </ReactLink>
                </div>}

                {startAdornment}

                <div className={"flex-grow"}/>

                {endAdornment &&
                    <ErrorBoundary>
                        {endAdornment}
                    </ErrorBoundary>}

                {includeModeToggle && <IconButton
                    color="inherit"
                    aria-label="Open drawer"
                    onClick={toggleMode}
                    size="large">
                    {mode === "dark"
                        ? <DarkModeIcon/>
                        : <LightModeIcon/>}
                </IconButton>}

                <Menu trigger={avatarComponent}>
                    {user && <div className={"px-4 py-2 mb-2"}>
                        {user.displayName && <Typography variant={"body1"} color={"secondary"}>
                            {user.displayName}
                        </Typography>}
                        {user.email && <Typography variant={"body2"} color={"secondary"}>
                            {user.email}
                        </Typography>}
                    </div>}

                    {dropDownActions}

                    {!dropDownActions && <MenuItem onClick={async () => {
                        await authController.signOut();
                        // replace current route with home
                        navigate("/");
                    }}>
                        <LogoutIcon/>
                        Log Out
                    </MenuItem>}

                </Menu>

            </div>
        </div>
    );
}
