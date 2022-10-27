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
import { useFireCMSContext, useNavigationContext } from "../../hooks";
import {
    GenericPluginProps,
    HomePageActionsProps,
    HomePageAdditionalCardsProps,
    TopNavigationEntry
} from "../../types";
import { getIconForView } from "../util";
import { toArray } from "../util/arrays";

/**
 * Default entry view for the CMS under the path "/"
 * This component takes navigation as an input and renders cards
 * for each entry, including title and description.
 * @constructor
 * @category Components
 */
export function FireCMSHomePage({ additionalChildren }: { additionalChildren?: React.ReactNode }) {

    const context = useFireCMSContext();
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

    let AdditionalSections: JSX.Element | undefined;
    if (context.plugins) {
        const sectionProps: GenericPluginProps = {
            context
        };
        AdditionalSections = <>
            {context.plugins.filter(plugin => plugin.homePage?.includeSection)
                .map((plugin, i) => {
                    const section = plugin.homePage!.includeSection!(sectionProps)
                    return (
                        <Box mt={6} mb={6}
                             key={`plugin_section_${plugin.name}`}>

                            <Typography color={"textSecondary"}
                                        className={"weight-500"}>
                                {section.title}
                            </Typography>

                            <Divider/>

                            <Box mt={2}>
                                {section.children}
                            </Box>
                        </Box>
                    );
                })}
        </>
        ;
    }

    return (
        <Container>
            {allGroups.map((group, index) => {

                const AdditionalCards: React.ComponentType<HomePageAdditionalCardsProps>[] = [];
                const actionProps: HomePageAdditionalCardsProps = {
                    group,
                    context
                };

                if (context.plugins) {
                    context.plugins.forEach(plugin => {
                        if (plugin.homePage?.additionalCards) {
                            AdditionalCards.push(...toArray(plugin.homePage?.additionalCards));
                        }
                    });
                }

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
                                            <NavigationCard {...entry}/>
                                        </Grid>)
                                }
                                {AdditionalCards && AdditionalCards.map((AdditionalCard, i) => (
                                    <Grid item
                                          xs={12}
                                          sm={6}
                                          lg={4}
                                          key={`nav_${group}_"add_${i}`}>
                                        <AdditionalCard {...actionProps}/>
                                    </Grid>
                                ))}

                            </Grid>
                        </Box>
                    </Box>
                );
            })}

            {AdditionalSections}

            {additionalChildren}

        </Container>
    );
}

export function NavigationCard({
                                   view,
                                   path,
                                   collection,
                                   url,
                                   name,
                                   description
                               }: TopNavigationEntry) {

    const CollectionIcon = getIconForView(collection ?? view);

    const context = useFireCMSContext();

    let Actions: JSX.Element | undefined;
    if (context.plugins && collection) {
        const actionProps: HomePageActionsProps = {
            path,
            collection,
            context
        };
        Actions = <>
            {context.plugins.map((plugin, i) => (
                plugin.homePage?.collectionActions
                    ? <plugin.homePage.collectionActions
                        key={`actions_${i}`} {...actionProps}/>
                    : null
            ))}
        </>
        ;
    }

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
                to={url}
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
                        <div onClick={(event: React.MouseEvent) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}>
                            {Actions}
                        </div>

                    </Box>

                    <Typography gutterBottom variant="h5"
                                component="h2">
                        {name}
                    </Typography>

                    {description && <Typography variant="body2"
                                                color="textSecondary"
                                                component="div">
                        <Markdown source={description}/>
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
