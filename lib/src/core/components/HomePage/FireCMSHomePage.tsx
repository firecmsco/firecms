import { Box, Container, Divider, Grid, Typography } from "@mui/material";
import { useFireCMSContext, useNavigationContext } from "../../../hooks";
import {
    GenericPluginProps,
    HomePageAdditionalCardsProps
} from "../../../types";
import { toArray } from "../../util/arrays";
import { NavigationGroup } from "./NavigationGroup";
import { NavigationCollectionCard } from "./NavigationCollectionCard";

/**
 * Default entry view for the CMS. This component renders navigation cards
 * for each collection defined in the navigation.
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
    if (navigationEntries.filter(e => !e.group).length > 0 || navigationEntries.length === 0) {
        allGroups.push(undefined);
    }

    let additionalSections: React.ReactNode | undefined;
    if (context.plugins) {
        const sectionProps: GenericPluginProps = {
            context
        };
        additionalSections = <>
            {context.plugins.filter(plugin => plugin.homePage?.includeSection)
                .map((plugin, i) => {
                    const section = plugin.homePage!.includeSection!(sectionProps)
                    return (
                        <NavigationGroup
                            group={section.title}
                            key={`plugin_section_${plugin.name}`}>
                            {section.children}
                        </NavigationGroup>
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
                        if (plugin.homePage?.AdditionalCards) {
                            AdditionalCards.push(...toArray(plugin.homePage?.AdditionalCards));
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
                                            <NavigationCollectionCard {...entry}
                                                                      onClick={() => {
                                                                          const event = entry.type === "collection" ? "home_navigate_to_collection" : (entry.type === "view" ? "home_navigate_to_view" : "unmapped_event");
                                                                          context.onAnalyticsEvent?.(event, { path: entry.path });
                                                                      }}/>
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

            {additionalSections}

            {additionalChildren}

        </Container>
    );
}
