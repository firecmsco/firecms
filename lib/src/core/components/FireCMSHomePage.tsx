import {
    Box,
    CardActionArea,
    CardActions,
    CardContent,
    Container,
    Divider,
    Grid,
    Paper,
    Typography
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { Link as ReactLink } from "react-router-dom";

import { Markdown } from "../../preview";
import { useNavigationContext } from "../../hooks";
import { TopNavigationEntry } from "../../models";
import { getIconForView } from "../util";

/**
 * Default entry view for the CMS under the path "/"
 * This component takes navigation as an input and renders cards
 * for each entry, including title and description.
 * @constructor
 * @category Components
 */
export function FireCMSHomePage() {

    const navigationContext = useNavigationContext();

    if (!navigationContext.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    const {
        navigationEntries,
        groups
    } = navigationContext.topLevelNavigation;

    const allGroups: Array<string | undefined> = [...groups];
    if (navigationEntries.filter(e => !e.group).length > 0) {
        allGroups.push(undefined);
    }

    return (
        <Container>
            {allGroups.map((group, index) => {
                return (
                    <Box mt={6} mb={6} key={`group_${index}`}>

                        <Typography color={"textSecondary"}
                                    className={"weight-500"}>
                            {group?.toUpperCase() ?? "Ungrouped views".toUpperCase()}
                        </Typography>

                        <Divider/>

                        <Box mt={2}>
                            <Grid container spacing={2}>
                                {navigationEntries
                                    .filter((entry) => entry.group === group || (!entry.group && group === undefined)) // so we don't miss empty groups
                                    .map((entry) =>
                                        <Grid item
                                              xs={12}
                                              sm={6}
                                              lg={4}
                                              key={`nav_${entry.group}_${entry.name}`}>
                                            <NavigationCard entry={entry}/>
                                        </Grid>)
                                }
                            </Grid>
                        </Box>
                    </Box>
                );
            })}

        </Container>
    );
}

type NavigationCardProps = {
    entry: TopNavigationEntry,
};

function NavigationCard({ entry }: NavigationCardProps) {
    const CollectionIcon = getIconForView(entry.collection ?? entry.view);
    return (
        <Paper variant={"outlined"}>

            <CardActionArea
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minHeight: 248
                }}
                component={ReactLink}
                to={entry.url}
            >
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

                        <CollectionIcon color={"disabled"}/>
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

        </Paper>);
}
