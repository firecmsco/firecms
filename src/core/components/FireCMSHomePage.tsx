import React from "react";
import {
    Box,
    CardActionArea,
    CardActions,
    CardContent,
    Container,
    Divider,
    Grid,
    Paper,
    Theme,
    Typography
} from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import { Link as ReactLink } from "react-router-dom";

import {
    computeTopNavigation,
    TopNavigationEntry
} from "../util/navigation_utils";
import { Markdown } from "../../preview";
import { useNavigation } from "../../hooks";

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

/**
 * Default entry view for the CMS under the path "/"
 * This components takes navigation as an input and renders cards
 * for each entry, including title and description.
 * @constructor
 * @category Components
 */
export function FireCMSHomePage() {

    const classes = useStyles();
    const navigationContext = useNavigation();
    if (!navigationContext.navigation)
        return <></>;

    const {
        navigationEntries,
        groups
    } = computeTopNavigation(navigationContext, true);

    const allGroups: Array<string | null> = [...groups];
    if (navigationEntries.filter(e => !e.group).length > 0) {
        allGroups.push(null);
    }

    function buildNavigationCard(entry: TopNavigationEntry) {
        return (
            <Grid item xs={12}
                  sm={6}
                  md={4}
                  key={`nav_${entry.group}_${entry.name}`}>
                <Paper variant={"outlined"}>

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
                </Paper>
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
                            {group?.toUpperCase() ?? "Collections".toUpperCase()}
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

