import React from "react";
import {
    AppBar,
    Avatar,
    Box,
    Breadcrumbs,
    Button,
    Chip,
    createStyles,
    emphasize,
    Hidden,
    IconButton,
    Link,
    makeStyles,
    Slide,
    Theme,
    Toolbar,
    Typography
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { Link as ReactLink } from "react-router-dom";
import { useBreadcrumbsContext } from "../contexts/BreacrumbsContext";
import { useAuthContext } from "../contexts/AuthContext";
import ErrorBoundary from "./ErrorBoundary";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        menuButton: {
            marginRight: theme.spacing(2)
        },
        breadcrumb: {
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
                backgroundColor: emphasize(theme.palette.grey[300], 0.12)
            }
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

        <Slide direction="down" in={true} mountOnEnter unmountOnExit>
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
                        <Box mr={3}>
                            <Typography variant="h6" noWrap>
                                {title}
                            </Typography>
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
                                    key={`breadcrumb-${index}`}
                                    color="inherit"
                                    component={ReactLink}
                                    to={entry.url}>
                                    <Chip
                                        classes={{root: classes.breadcrumb}}
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
                        {authContext.loggedUser && authContext.loggedUser.photoURL ?
                            <Avatar
                                src={authContext.loggedUser.photoURL}/>
                            :
                            <Avatar>{authContext.loggedUser?.displayName ? authContext.loggedUser.displayName[0] : "A"}</Avatar>
                        }
                    </Box>

                    <Button variant="text"
                            color="inherit"
                            onClick={authContext.signOut}>
                        Log Out
                    </Button>

                </Toolbar>
            </AppBar>
        </Slide>
    );
};
