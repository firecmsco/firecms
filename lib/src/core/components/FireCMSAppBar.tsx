import React from "react";
import {
    Avatar,
    Box,
    Breadcrumbs,
    Button,
    Chip,
    Hidden,
    IconButton,
    Link,
    Slide,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link as ReactLink } from "react-router-dom";
import { ErrorBoundary } from "../components";
import {
    useAuthController,
    useBreadcrumbsContext,
    useModeController
} from "../../hooks";
import { DRAWER_WIDTH } from "../Scaffold";
import TTypography from "../../migrated/TTypography";

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
    const { mode, toggleMode } = useModeController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const initial = authController.user?.displayName
        ? authController.user.displayName[0].toUpperCase()
        : (authController.user?.email ? authController.user.email[0].toUpperCase() : "A");

    return (
        <Box
            className={`fixed ${largeLayout ? "z-[calc(" + theme.zIndex.drawer + "+1)]" : ""} transition-all duration-[${theme.transitions.duration.leavingScreen}] ease-[${theme.transitions.easing.sharp}]`}
            style={{
                marginLeft: theme.spacing(8),
                width: `calc(100% - ${theme.spacing(8)})`,
                zIndex: largeLayout ? theme.zIndex.drawer + 1 : undefined,
                transition: theme.transitions.create(["width", "margin"], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                ...(drawerOpen && largeLayout && {
                    marginLeft: `calc(${DRAWER_WIDTH}px - 8px)`,
                    width: `calc(100% - ${DRAWER_WIDTH}px)`,
                    transition: theme.transitions.create(["width", "margin"], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }),
            }}>

            <Slide
                direction="down" in={true} mountOnEnter unmountOnExit>
                <Toolbar className="space-x-1 space-y-1">

                    <Hidden lgDown>
                        <Box mr={2}>
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
                        </Box>
                    </Hidden>

                    {largeLayout && <Box>
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
                    </Box>}

                    <Box flexGrow={1}/>

                    {toolbarExtraWidget &&
                        <ErrorBoundary>
                            {
                                toolbarExtraWidget
                            }
                        </ErrorBoundary>}

                    <Box p={1}>
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
                    </Box>

                    <Box p={1}>
                        {authController.user && authController.user.photoURL
                            ? <Avatar
                                src={authController.user.photoURL}/>
                            : <Avatar>{initial}</Avatar>
                        }
                    </Box>

                    <Button variant="text"
                            color="inherit"
                            onClick={authController.signOut}>
                        Log Out
                    </Button>

                </Toolbar>
            </Slide>
        </Box>
    );
}
