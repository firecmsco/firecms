import React from "react";

import { Link, useNavigate } from "react-router-dom";
import { ErrorBoundary, FireCMSLogo, LanguageToggle } from "../components";
import {
    Avatar,
    BrightnessMediumIcon,
    CheckIcon,
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
import { useAuthController, useLargeLayout, useModeController, useNavigationController, useTranslation } from "../hooks";
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
    
    const { i18n, t } = useTranslation();

    const navigate = useNavigate();

    const largeLayout = useLargeLayout();

    const user = userProp ?? authController.user;

    let avatarComponent: React.ReactElement | null;

    if (user) {
        const initial = user?.displayName
            ? user.displayName[0].toUpperCase()
            : (user?.email ? user.email[0].toUpperCase() : "A");
        avatarComponent = <Avatar src={user.photoURL ?? undefined}>
            {initial}
        </Avatar>;
    } else if (user === undefined || authController.initialLoading) {
        avatarComponent = <div className={"p-1 flex justify-center"}>
            <Skeleton className={"w-10 h-10 rounded-full"} />
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
                    className="visited:text-inherit visited:dark:text-inherit block"
                    to={navigation?.basePath ?? "/"}
                >
                    <div className={"flex flex-row gap-4"}>
                        {!hasDrawer && (logo
                            ? <img src={logo}
                                alt="Logo"
                                className={cls("w-[32px] h-[32px] object-contain")} />
                            : <FireCMSLogo width={"32px"} height={"32px"} />)}

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
                <div className={"flex flex-row gap-2 items-center"}>
                    {breadcrumbs.breadcrumbs.map((breadcrumb, index) => {
                        return <React.Fragment key={breadcrumb.url + "_" + index}>
                            <Typography variant={"caption"} color={"secondary"}>
                                /
                            </Typography>
                            <Link
                                key={index}
                                className="visited:text-inherit visited:dark:text-inherit block"
                                to={breadcrumb.url}
                            >
                                <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                                    <Typography variant={"body2"}>
                                        {breadcrumb.title}
                                    </Typography>
                                    {/* Show count badge for collection breadcrumbs: undefined = not applicable, null = loading, number = count */}
                                    {breadcrumb.count !== undefined && (
                                        breadcrumb.count !== null ? (
                                            <span className="text-xs text-surface-accent-500 dark:text-surface-accent-400 bg-surface-100 dark:bg-surface-700 px-1 py-0 rounded">
                                                {breadcrumb.count}
                                            </span>
                                        ) : (
                                            <Skeleton className="w-8 h-4 rounded-md" />
                                        )
                                    )}
                                </div>
                            </Link>
                        </React.Fragment>;
                    })}
                </div>
            </div>}


            {startAdornment}

            <div className={"flex-grow"} />

            {endAdornment &&
                <ErrorBoundary>
                    {endAdornment}
                </ErrorBoundary>}

            {includeModeToggle &&
                <Menu
                    trigger={<IconButton
                        color="inherit"
                        aria-label="Open drawer">
                        {mode === "dark"
                            ? <DarkModeIcon size="small" />
                            : <LightModeIcon size="small" />}
                    </IconButton>}>
                    <MenuItem onClick={() => setMode("dark")}><DarkModeIcon size={"smallest"} /> {t("dark_mode")}</MenuItem>
                    <MenuItem onClick={() => setMode("light")}><LightModeIcon size={"smallest"} /> {t("light_mode")}</MenuItem>
                    <MenuItem onClick={() => setMode("system")}> <BrightnessMediumIcon
                        size={"smallest"} />{t("system_mode")}</MenuItem>
                </Menu>}

            <LanguageToggle />

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
                    <LogoutIcon />
                    {t("log_out")}
                </MenuItem>}

            </Menu>

        </div>
    );
}
