import React from "react";
import {
    AppBar,
    Avatar,
    Box,
    Breadcrumbs,
    Button,
    IconButton,
    Link,
    Toolbar,
    Typography
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { BreadcrumbContainer } from "./BreadcrumbContainer";
import { Link as ReactLink } from "react-router-dom";
import { useStyles } from "../styles";
import { useBreadcrumbsContext } from "../breadcrumbs_controller";
import { buildCollectionPath, replacePathIdentifiers } from "../routes";
import { useAuthContext } from "../auth";

interface BreadcrumbProps {
    title: string;
    handleDrawerToggle: () => void
}

export const CMSAppBar: React.FunctionComponent<BreadcrumbProps> = ({ title, handleDrawerToggle }) => {

    const classes = useStyles();

    const breadcrumbsContext = useBreadcrumbsContext();
    const { breadcrumbs, pathParams } = breadcrumbsContext;

    const authContext = useAuthContext();
    return (
        <AppBar>
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

                <Typography variant="h6" noWrap>
                    {title}
                </Typography>

                <Box ml={3} mr={3}>
                    <BreadcrumbContainer>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Link color="inherit" component={ReactLink}
                                  to="/">
                                Home
                            </Link>
                            {breadcrumbs.map(entry =>
                                (entry.placeHolderId && !pathParams[entry.placeHolderId]) ?
                                    null :
                                    <Link
                                        key={`breadcrumb-${entry.relativePlaceholderPath}`}
                                        color="inherit"
                                        component={ReactLink}
                                        to={buildCollectionPath(replacePathIdentifiers(pathParams, entry.relativePlaceholderPath))}>
                                        {entry.placeHolderId ? pathParams[entry.placeHolderId] : entry.view.name}
                                    </Link>)
                                .filter(c => !!c)}
                        </Breadcrumbs>
                    </BreadcrumbContainer>
                </Box>

                <Box className={classes.grow}/>

                <Box p={2}>
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
