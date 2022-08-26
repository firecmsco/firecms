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
    Tooltip,
    Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link as ReactLink } from "react-router-dom";
import { ErrorBoundary } from "../components";
import { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import {
    useAuthController,
    useBreadcrumbsContext,
    useModeController
} from "../../hooks";
import { styled } from "@mui/material/styles";
import { DRAWER_WIDTH } from "../Scaffold";
import { getAltSymbol } from "../util/os";

interface CMSAppBarProps {
    title: string;
    handleDrawerOpen: () => void,
    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;

    drawerOpen: boolean;
}

export const FireCMSAppBar = function FireCMSAppBar({
                                                        title,
                                                        handleDrawerOpen,
                                                        toolbarExtraWidget,
                                                        drawerOpen
                                                    }: CMSAppBarProps) {

    const breadcrumbsContext = useBreadcrumbsContext();
    const { breadcrumbs } = breadcrumbsContext;

    const authController = useAuthController();
    const { mode, toggleMode } = useModeController();

    const initial = authController.user?.displayName
        ? authController.user.displayName[0].toUpperCase()
        : (authController.user?.email ? authController.user.email[0].toUpperCase() : "A");

    return (
        <StyledAppBar
            position={"fixed"}
            open={drawerOpen}>

            <Slide
                direction="down" in={true} mountOnEnter unmountOnExit>
                <Toolbar>
                    <Tooltip title={getAltSymbol()}>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            edge="start"
                            onClick={handleDrawerOpen}
                            sx={{
                                mr: 2,
                                ...(drawerOpen && { display: "none" })
                            }}
                            size="large">
                            <MenuIcon/>
                        </IconButton>
                    </Tooltip>

                    <Hidden lgDown>
                        <Box mr={3}>
                            <Link
                                underline={"none"}
                                key={"breadcrumb-home"}
                                color="inherit"
                                component={ReactLink}
                                to={"/"}>
                                <Typography variant="h6" noWrap>
                                    {title}
                                </Typography>
                            </Link>
                        </Box>
                    </Hidden>

                    <Box mr={2}>
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
                                        sx={theme => ({
                                            backgroundColor: theme.palette.grey[200],
                                            height: theme.spacing(3),
                                            color: theme.palette.grey[800],
                                            fontWeight: theme.typography.fontWeightMedium,
                                            "&:hover, &:focus": {
                                                cursor: "pointer",
                                                backgroundColor: theme.palette.grey[300]
                                            },
                                            "&:active": {
                                                boxShadow: theme.shadows[1],
                                                backgroundColor: theme.palette.grey[400]
                                            }
                                        })}
                                        label={entry.title}
                                    />
                                </Link>)
                            )
                            }
                        </Breadcrumbs>
                    </Box>

                    <Box flexGrow={1}/>

                    {toolbarExtraWidget &&
                        <ErrorBoundary>
                            {
                                toolbarExtraWidget
                            }
                        </ErrorBoundary>}

                    <Box p={1} mr={1}>
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

                    <Box p={1} mr={1}>
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
            </StyledAppBar>
    );
}

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const StyledAppBar = styled(Box, {
    shouldForwardProp: (prop) => prop !== "open"
})<AppBarProps>(({ theme, open }) => ({
    width: "100%",
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    }),
    ...(open && {
        marginLeft: DRAWER_WIDTH,
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    })
}));
