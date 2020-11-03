import React from "react";
import {
    AppBar,
    Avatar,
    Box,
    Breadcrumbs,
    Button,
    createStyles,
    Hidden,
    IconButton,
    Link,
    makeStyles,
    Theme,
    Toolbar,
    Typography
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { BreadcrumbContainer } from "./BreadcrumbContainer";
import { Link as ReactLink } from "react-router-dom";
import { useBreadcrumbsContext } from "../BreacrumbsContext";
import { useAuthContext } from "../auth";
import ErrorBoundary from "./ErrorBoundary";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        menuButton: {
            marginRight: theme.spacing(2)
            // [theme.breakpoints.up("md")]: {
            //     display: "none"
            // }
        }
    })
);


interface CMSAppBarProps {
    title: string;
    handleDrawerToggle: () => void,
    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;
}

export const CMSAppBar: React.FunctionComponent<CMSAppBarProps> = ({
                                                                       title,
                                                                       handleDrawerToggle,
                                                                       toolbarExtraWidget
                                                                   }) => {

    const classes = useStyles();

    const breadcrumbsContext = useBreadcrumbsContext();
    const { breadcrumbs } = breadcrumbsContext;

    const authContext = useAuthContext();
    return (
        <AppBar position={"relative"} elevation={2}>

            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    className={classes.menuButton}
                >
                    <MenuIcon/>
                </IconButton>

                <Hidden smDown>
                    <Typography variant="h6" noWrap>
                        {title}
                    </Typography>
                </Hidden>

                <Box ml={3} mr={3}>
                    <BreadcrumbContainer>
                        <Breadcrumbs aria-label="breadcrumb">
                            {breadcrumbs.map((entry, index) => (

                                <Link
                                    key={`breadcrumb-${index}`}
                                    color="inherit"
                                    component={ReactLink}
                                    to={entry.url}>
                                    {entry.title}
                                </Link>))
                            }
                        </Breadcrumbs>
                    </BreadcrumbContainer>
                </Box>

                <Box flexGrow={1}/>

                {toolbarExtraWidget &&
                <ErrorBoundary>
                    {
                        toolbarExtraWidget
                    }
                </ErrorBoundary>}

                <Box p={1} mr={1}>
                    {authContext.loggedUser && authContext.loggedUser.photoURL ?
                        <Avatar
                            src={authContext.loggedUser.photoURL}/>
                        :
                        <Avatar>{authContext.loggedUser?.displayName ? authContext.loggedUser.displayName[0] : "A"}</Avatar>
                    }
                </Box>

                <Button variant="text"
                        color="inherit"
                        onClick={authContext.onSignOut}>
                    Log Out
                </Button>

            </Toolbar>
        </AppBar>
    );
};
