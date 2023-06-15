import React from "react";
import {
    Avatar,
    Breadcrumbs,
    Button,
    Chip,
    Hidden,
    IconButton,
    Link,
    Slide,
    useMediaQuery,
    useTheme
} from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link as ReactLink } from "react-router-dom";
import { ErrorBoundary } from "../components";
import { useAuthController, useBreadcrumbsContext, useModeController } from "../../hooks";
import TTypography from "../../components/TTypography";
import clsx from "clsx";

export interface FireCMSAppBarProps {
    title: string;
    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;

    drawerOpen: boolean;
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
                                                        toolbarExtraWidget,
                                                        drawerOpen
                                                    }: FireCMSAppBarProps) {

    const breadcrumbsContext = useBreadcrumbsContext();
    const { breadcrumbs } = breadcrumbsContext;

    const authController = useAuthController();
    const {
        mode,
        toggleMode
    } = useModeController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const initial = authController.user?.displayName
        ? authController.user.displayName[0].toUpperCase()
        : (authController.user?.email ? authController.user.email[0].toUpperCase() : "A");

    return (
        <div
            className={clsx({
                "ml-64": drawerOpen && largeLayout,
                "ml-16": !(drawerOpen && largeLayout),
                "h-16": true,
                "z-[1100]": largeLayout,
                "transition-all": true,
                "ease-in": true,
                "duration-75": true,
                "w-[calc(100%-64px)]": !(drawerOpen && largeLayout),
                "w-[calc(100%-256px)]": drawerOpen && largeLayout,
                "duration-150": drawerOpen && largeLayout,
                fixed: true
            })}>

            <Slide
                direction="down" in={true} mountOnEnter unmountOnExit>
                <div className="flex flex-row space-x-1 space-y-1 px-4 h-full items-center">

                    <Hidden lgDown>
                        <div className="mr-8">
                            <Link
                                underline={"none"}
                                key={"breadcrumb-home"}
                                color="inherit"
                                component={ReactLink}
                                to={"."}>
                                <TTypography variant="h6"
                                             noWrap
                                             className={"weight-500"}>
                                    {title}
                                </TTypography>
                            </Link>
                        </div>
                    </Hidden>

                    {largeLayout && <div>
                        <Breadcrumbs
                            separator={<NavigateNextIcon
                                htmlColor={"rgb(0,0,0,0.87)"}
                                fontSize="small"/>}
                            aria-label="breadcrumb">
                            {breadcrumbs.map((entry, index) => (
                                <Link
                                    underline={"none"}
                                    key={`breadcrumb-${index}`}
                                    color="inherit"
                                    component={ReactLink}
                                    to={entry.url}>
                                    <Chip
                                        className="bg-gray-200 h-12 text-gray-800 font-medium hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-400 active:shadow-sm cursor-pointer"
                                        label={entry.title}
                                    />
                                </Link>)
                            )
                            }
                        </Breadcrumbs>
                    </div>}

                    <div className={"flex-grow"}/>

                    {toolbarExtraWidget &&
                        <ErrorBoundary>
                            {
                                toolbarExtraWidget
                            }
                        </ErrorBoundary>}

                    <div className={"p-4"}>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            edge="start"
                            onClick={() => toggleMode()}
                            size="large">
                            {mode === "dark"
                                ? <DarkModeOutlinedIcon/>
                                : <LightModeOutlinedIcon/>}
                        </IconButton>
                    </div>

                    <div className={"p-4"}>
                        {authController.user && authController.user.photoURL
                            ? <Avatar
                                src={authController.user.photoURL}/>
                            : <Avatar>{initial}</Avatar>
                        }
                    </div>

                    <Button variant="text"
                            color="inherit"
                            onClick={authController.signOut}>
                        Log Out
                    </Button>

                </div>
            </Slide>
        </div>
    );
}
