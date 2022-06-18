import React from "react";
import {
    AppBar,
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
    Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link as ReactLink } from "react-router-dom";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useAuthController, useModeController } from "../../hooks";
import { useBreadcrumbsContext } from "../../hooks/useBreadcrumbsContext";

interface CMSAppBarProps {
    title: string;
    handleDrawerToggle: () => void,
    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;
}

export const FireCMSAppBar = React.memo(
    function FireCMSAppBar({
                               title,
                               handleDrawerToggle,
                               toolbarExtraWidget
                           }: CMSAppBarProps) {

    const breadcrumbsContext = useBreadcrumbsContext();
        const { breadcrumbs } = breadcrumbsContext;

        const authController = useAuthController();
        const { mode, toggleMode } = useModeController();

    const initial = authController.user?.displayName
        ? authController.user.displayName[0].toUpperCase()
        : (authController.user?.email ? authController.user.email[0].toUpperCase() : "A");

    return (
        <Slide
            direction="down" in={true} mountOnEnter unmountOnExit>
            <AppBar
                position={"relative"}
                elevation={1}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="Open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                        size="large">
                        <MenuIcon/>
                    </IconButton>

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
                                            backgroundColor: theme.palette.grey[100],
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
            </AppBar>
        </Slide>
    );
    },
    function areEqual(prevProps: CMSAppBarProps, nextProps: CMSAppBarProps) {
        return prevProps.title === nextProps.title;
    }
)

