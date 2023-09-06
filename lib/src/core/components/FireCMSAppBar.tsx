import React from "react";

import { Link as ReactLink } from "react-router-dom";
import { ErrorBoundary, } from "../components";
import { Avatar, cn, IconButton, Menu, MenuItem, Typography } from "../../components";
import {
    useAuthController,
    useBreadcrumbsContext,
    useLargeLayout,
    useModeController,
    useNavigationContext
} from "../../hooks";
import { DarkModeIcon, LightModeIcon, LogoutIcon } from "../../icons";
import { AuthController } from "../../types";

export interface FireCMSAppBarProps {
    title: string;
    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    children?: React.ReactNode;

    startAdornment?: React.ReactNode;

    dropDownActions?: React.ReactNode;

    drawerOpen: boolean;

    className?: string;

    authController?: AuthController;

    style?: React.CSSProperties;
}

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
                                                        children,
                                                        startAdornment,
                                                        drawerOpen,
                                                        dropDownActions,
                                                        // authController: authControllerProp,
                                                        className,
                                                        style
                                                    }: FireCMSAppBarProps) {

    const breadcrumbsContext = useBreadcrumbsContext();
    const { breadcrumbs } = breadcrumbsContext;
    const navigation = useNavigationContext();

    const authController = useAuthController();
    const {
        mode,
        toggleMode
    } = useModeController();

    const largeLayout = useLargeLayout();

    const initial = authController.user?.displayName
        ? authController.user.displayName[0].toUpperCase()
        : (authController.user?.email ? authController.user.email[0].toUpperCase() : "A");

    return (
        <div
            style={style}
            className={cn("pr-2",
                {
                    "ml-[18rem]": drawerOpen && largeLayout,
                    "ml-16": !(drawerOpen && largeLayout) && !startAdornment,
                    "h-16": true,
                    "z-10": largeLayout,
                    "transition-all": true,
                    "ease-in": true,
                    "duration-75": true,
                    "w-[calc(100%-64px)]": !(drawerOpen && largeLayout),
                    "w-[calc(100%-18rem)]": drawerOpen && largeLayout,
                    "duration-150": drawerOpen && largeLayout,
                    fixed: true,
                },
                className)}>

            <div className="flex flex-row gap-2 px-4 h-full items-center">

                {startAdornment}

                <div className="mr-8 hidden lg:block">
                    <ReactLink
                        className="visited:text-inherit visited:dark:text-inherit"
                        to={navigation.basePath ?? "/"}>
                        <Typography variant="subtitle1"
                                    noWrap
                                    className={"ml-2 !font-medium"}>
                            {title}
                        </Typography>
                    </ReactLink>
                </div>

                {/*{largeLayout && <div className="flex gap-1 flex-grow">*/}
                {/*    {breadcrumbs.map((entry, index) => (*/}
                {/*        <ReactLink*/}
                {/*            key={`breadcrumb-${index}`}*/}
                {/*            color="inherit"*/}
                {/*            to={entry.url}>*/}
                {/*            <Chip*/}
                {/*                className=" h-12 font-medium active:bg-gray-400 active:shadow-sm cursor-pointer">*/}
                {/*                {entry.title}*/}
                {/*            </Chip>*/}
                {/*        </ReactLink>)*/}
                {/*    )*/}
                {/*    }*/}
                {/*</div>}*/}

                <div className={"flex-grow"}/>

                {children &&
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>}

                <IconButton
                    color="inherit"
                    aria-label="Open drawer"
                    onClick={() => toggleMode()}
                    size="large">
                    {mode === "dark"
                        ? <DarkModeIcon/>
                        : <LightModeIcon/>}
                </IconButton>

                <Menu
                    trigger={authController.user && authController.user.photoURL
                        ? <Avatar
                            src={authController.user.photoURL}/>
                        : <Avatar>{initial}</Avatar>
                    }
                >

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
