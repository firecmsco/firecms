import React from "react";

import { Link as ReactLink } from "react-router-dom";
import { ErrorBoundary, FireCMSLogo } from "../components";
import {
    Avatar,
    cn,
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

export type FireCMSAppBarProps<ADDITIONAL_PROPS = object> = {

    title: React.ReactNode;
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

    logo?: string;

    user?: User;
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
                                                        style,
                                                        logo,
                                                        user: userProp
                                                    }: FireCMSAppBarProps) {
    const navigation = useNavigationController();

    const authController = useAuthController();
    const {
        mode,
        toggleMode
    } = useModeController();

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
                    fixed: true
                },
                className)}>

            <div className="flex flex-row gap-2 px-4 h-full items-center">

                {startAdornment}


                {navigation && <div className="mr-8 hidden lg:block">
                    <ReactLink
                        className="visited:text-inherit visited:dark:text-inherit"
                        to={navigation?.basePath ?? "/"}
                    >
                        <div className={"flex flex-row gap-4"}>
                            {!includeDrawer && (logo
                                ? <img src={logo}
                                       alt="Logo"
                                       className={cn("w-[32px] h-[32px]")}/>
                                : <FireCMSLogo width={"32px"} height={"32px"}/>)}

                            {typeof title === "string"
                                ? <Typography variant="subtitle1"
                                              noWrap
                                              className={"ml-2 !font-medium"}>
                                    {title}
                                </Typography>
                                : title}
                        </div>
                    </ReactLink>
                </div>}

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
                    {user && <div className={"px-4 py-2 mb-2"}>
                        {user.displayName && <Typography variant={"body1"} color={"secondary"}>
                            {user.displayName}
                        </Typography>}
                        {user.email && <Typography variant={"body2"} color={"secondary"}>
                            {user.email}
                        </Typography>}
                    </div>}

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
