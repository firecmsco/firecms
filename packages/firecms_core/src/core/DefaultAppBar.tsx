import React from "react";

import { Link, useNavigate } from "react-router-dom";
import { ErrorBoundary, FireCMSLogo } from "../components";
import {
    Avatar,
    BrightnessMediumIcon,
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
import { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";

export type DefaultAppBarProps<ADDITIONAL_PROPS = object> = {

    /**
     * The content of the app bar, usually a title or logo. This includes a link to the home page.
     */
    title?: React.ReactNode;

    /**
     * A component that gets rendered on the upper side to the end of the main toolbar
     */
    endAdornment?: React.ReactNode;

    /**
     * A component that gets rendered on the upper side to the start of the main toolbar
     */
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
                                                        user: userProp,
                                                        logo: logoProp,
                                                    }: DefaultAppBarProps) {

    const {
        hasDrawer,
        drawerOpen,
        logo: appLogo
    } = useApp();

    const logo = logoProp ?? appLogo;

    const navigation = useNavigationController();

    const breadcrumbs = useBreadcrumbsController();

    const authController = useAuthController();
    const {
        mode,
        setMode
    } = useModeController();

    const navigate = useNavigate();

    const largeLayout = useLargeLayout();

    const user = userProp ?? authController.user;

    let avatarComponent: JSX.Element | null;

    if (user) {
        const initial = user?.displayName
            ? user.displayName[0].toUpperCase()
            : (user?.email ? user.email[0].toUpperCase() : "A");
        avatarComponent = <Avatar src={user.photoURL ?? undefined}>
            {initial}
        </Avatar>;
    } else if (user === undefined || authController.initialLoading) {
        avatarComponent = <div className={"p-1 flex justify-center"}>
            <Skeleton className={"w-10 h-10 rounded-full"}/>
        </div>;
    } else {
        avatarComponent = null;
    }

    return (
        <div
            style={style}
            className={cls("w-full h-16 transition-all ease-in duration-75 absolute top-0 max-w-full overflow-x-auto no-scrollbar",
                "flex flex-row gap-2 px-4 items-center",
                {
                    "pl-[19rem]": drawerOpen && largeLayout,
                    "pl-24": hasDrawer && !(drawerOpen && largeLayout),
                    "z-10": largeLayout,
                    "duration-100": drawerOpen && largeLayout,
                },
                className)}>


            {navigation && <div className="mr-2 hidden lg:block">
                <Link
                    className="visited:text-inherit dark:visited:text-inherit block"
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
                                          noWrap>
                                {title}
                            </Typography>
                            : title}
                    </div>
                </Link>
            </div>}

            {(breadcrumbs.breadcrumbs ?? []).length > 0 && <div className="mr-8 hidden lg:block">
                <div className={"flex flex-row gap-2"}>
                    {breadcrumbs.breadcrumbs.map((breadcrumb, index) => {
                        return <React.Fragment key={breadcrumb.url + "_" + index}>
                            <Typography variant={"caption"} color={"secondary"}>
                                /
                            </Typography>
                            <Link
                                key={index}
                                className="visited:text-inherit dark:visited:text-inherit block"
                                to={breadcrumb.url}
                            >
                                <Typography variant={"caption"} color={"secondary"}>
                                    {breadcrumb.title}
                                </Typography>
                            </Link>
                        </React.Fragment>;
                    })}
                </div>
            </div>}

            {startAdornment}

            <div className={"grow"}/>

            {endAdornment &&
                <ErrorBoundary>
                    {endAdornment}
                </ErrorBoundary>}

            {includeModeToggle &&
                <Menu
                    trigger={<IconButton
                        color="inherit"
                        aria-label="Open drawer"
                        size="large">
                        {mode === "dark"
                            ? <DarkModeIcon/>
                            : <LightModeIcon/>}
                    </IconButton>}>
                    <MenuItem onClick={() => setMode("dark")}><DarkModeIcon size={"smallest"}/> Dark</MenuItem>
                    <MenuItem onClick={() => setMode("light")}><LightModeIcon size={"smallest"}/> Light </MenuItem>
                    <MenuItem onClick={() => setMode("system")}> <BrightnessMediumIcon
                        size={"smallest"}/>System</MenuItem>
                </Menu>}

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
    );
}
