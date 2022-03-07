import { useEffect, useState } from "react";
import {
    Box,
    CardActionArea,
    CardActions,
    CardContent,
    Container,
    Divider,
    Grid,
    IconButton,
    Paper,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import EditIcon from "@mui/icons-material/Edit";

import { Link as ReactLink } from "react-router-dom";

import {
    computeTopNavigation,
    TopNavigationEntry,
    TopNavigationResult
} from "../util/navigation_utils";
import { Markdown } from "../../preview";
import { useNavigation } from "../../hooks";
import {
    useConfigurationPersistence
} from "../../hooks/useConfigurationPersistence";

/**
 * Default entry view for the CMS under the path "/"
 * This components takes navigation as an input and renders cards
 * for each entry, including title and description.
 * @constructor
 * @category Components
 */
export function FireCMSHomePage() {

    const navigationContext = useNavigation();
    const configurationPersistence = useConfigurationPersistence();
    const configurationPersistenceEnabled = Boolean(configurationPersistence);

    const [navigationResult, setNavigationResult] = useState<TopNavigationResult>(computeTopNavigation(navigationContext, true));

    useEffect(() => {
        setNavigationResult(computeTopNavigation(navigationContext, true))
    }, [navigationContext.navigation])

    if (!navigationContext.navigation)
        return <></>;

    const {
        navigationEntries,
        groups
    } = navigationResult;

    const allGroups: Array<string | undefined> = [...groups];
    if (configurationPersistenceEnabled || navigationEntries.filter(e => !e.group).length > 0) {
        allGroups.push(undefined);
    }

    function buildNavigationCard(entry: TopNavigationEntry) {
        return (
            <Grid item xs={12}
                  sm={6}
                  md={4}
                  key={`nav_${entry.group}_${entry.name}`}>
                <Paper variant={"outlined"}>

                    <CardActionArea
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            minHeight: 248
                        }}
                        component={ReactLink}
                        to={entry.url}>
                        <CardContent
                            sx={{
                                flexGrow: 1,
                                width: "100%"
                            }}>

                            <Box sx={{
                                height: 40,
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                justifyContent: "space-between"
                            }}>
                                <PlaylistPlayIcon color={"disabled"}/>

                                {configurationPersistenceEnabled && entry.editUrl &&
                                <IconButton
                                    component={ReactLink}
                                    to={entry.editUrl}>
                                    <EditIcon color="primary"/>
                                </IconButton>}
                            </Box>

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

    function buildAddCollectionNavigationCard(group?: string) {
        return (
            <Grid item xs={12}
                  sm={6}
                  md={4}
                  key={`nav_${group}_"add`}>
                <Paper variant={"outlined"}
                       sx={{ height: "100%", minHeight: 124 }}>
                    <CardActionArea
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start"
                        }}
                        component={ReactLink}
                        to={navigationContext.buildUrlEditCollectionPath({ group })}
                        state={{ group: group }}>

                        <CardContent
                            sx={{
                                height: "100%",
                                flexGrow: 1
                            }}>
                            <AddIcon color="primary"/>
                        </CardContent>

                    </CardActionArea>
                </Paper>
            </Grid>
        );
    }

    return (
        <Container>
            {allGroups.map((group, index) => (
                <Box mt={6} mb={6} key={`group_${index}`}>

                    <Typography color={"textSecondary"}
                                className={"weight-500"}>
                        {group?.toUpperCase() ?? "Ungrouped collections".toUpperCase()}
                    </Typography>

                    <Divider/>

                    <Box mt={2}>
                        <Grid container spacing={2}>
                            {navigationEntries
                                .filter((entry) => entry.group === group || (!entry.group && group === undefined)) // so we don't miss empty groups
                                .map((entry) => buildNavigationCard(entry))
                            }
                            {buildAddCollectionNavigationCard(group)}
                        </Grid>
                    </Box>
                </Box>
            ))}
        </Container>
    );
}
