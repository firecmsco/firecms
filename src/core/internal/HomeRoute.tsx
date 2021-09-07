import React, { useEffect } from "react";
import {
    Box,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    Container,
    Divider,
    Grid,
    Theme,
    Typography
} from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import { Link as ReactLink, useLocation } from "react-router-dom";

import {
    BreadcrumbEntry,
    computeNavigation,
    NavigationEntry
} from "../navigation";
import { useBreadcrumbsContext } from "../../contexts";
import { Navigation } from "../../models";
import { Markdown } from "../../preview";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            minHeight: 248
        },
        flexGrow: {
            flexGrow: 1
        }
    })
);


interface HomeRouteProps {
    navigation: Navigation;
}

function HomeRoute({
                       navigation
                   }: HomeRouteProps) {

    const classes = useStyles();
    const { pathname } = useLocation();

    const breadcrumb: BreadcrumbEntry = {
        title: "Home",
        url: pathname
    };

    const breadcrumbsContext = useBreadcrumbsContext();

    useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: [breadcrumb]
        });
    }, [pathname]);

    const {
        navigationEntries,
        groups
    } = computeNavigation(navigation, true);

    const allGroups: Array<string | null> = [...groups];
    if (navigationEntries.filter(e => !e.group).length > 0) {
        allGroups.push(null);
    }

    function buildNavigationCard(entry: NavigationEntry) {
        return (
            <Grid item xs={12} sm={6} md={4}
                  key={`nav_${entry.group}_${entry.name}`}>
                <Card elevation={0}>

                    <CardActionArea
                        className={classes.card}
                        component={ReactLink}
                        to={entry.url}>
                        <CardContent
                            className={classes.flexGrow}>

                            <PlaylistPlayIcon color={"disabled"}/>
                            <Typography gutterBottom variant="h5"
                                        component="h2">
                                {entry.name}
                            </Typography>

                            {entry.description && <Typography variant="body2"
                                                              color="textSecondary"
                                                              component="div">
                                <Markdown source={entry.description}/>
                            </Typography>}
                        </CardContent>

                        <CardActions style={{ alignSelf: "flex-end" }}>
                            <Box p={1}>
                                <ArrowForwardIcon color="primary"/>
                            </Box>
                        </CardActions>

                    </CardActionArea>
                </Card>
            </Grid>
        );
    }


    return (
        <Container>
            {allGroups.map((group, index) => (
                <Box mt={6} mb={6} key={`group_${index}`}>
                    {allGroups.length > 0 && <>
                        <Typography color={"textSecondary"}
                                    className={"weight-500"}>
                            {group?.toUpperCase() ?? "Ungrouped".toUpperCase()}
                        </Typography>
                        <Divider/>
                    </>}

                    <Box mt={2}>
                        <Grid container spacing={2}>
                            {group && navigationEntries
                                .filter((entry) => entry.group === group)
                                .map((entry) => buildNavigationCard(entry))
                            }
                            {!group && navigationEntries
                                .filter((entry) => !entry.group)
                                .map((entry) => buildNavigationCard(entry))
                            }
                        </Grid>
                    </Box>
                </Box>
            ))}
        </Container>
    );
}

export default HomeRoute;
