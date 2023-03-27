import { useCallback, useEffect, useState } from "react";

import { Box, Container, Grid } from "@mui/material";

import { useFireCMSContext, useNavigationContext } from "../../../hooks";
import {
    PluginGenericProps,
    PluginHomePageAdditionalCardsProps
} from "../../../types";

import { toArray } from "../../util/arrays";
import { NavigationGroup } from "./NavigationGroup";
import { NavigationCollectionCard } from "./NavigationCollectionCard";

import Index from "flexsearch";
import { SearchBar } from "../EntityCollectionTable/internal/SearchBar";
import {
    useUserConfigurationPersistence
} from "../../../hooks/useUserConfigurationPersistence";
import { FavouritesView } from "./FavouritesView";

export const searchIndex = new Index(
    // @ts-ignore
    {
        charset: "latin:advanced",
        tokenize: "full"
    });

/**
 * Default entry view for the CMS. This component renders navigation cards
 * for each collection defined in the navigation.
 * @constructor
 * @category Components
 */
export function FireCMSHomePage({ additionalChildren }: { additionalChildren?: React.ReactNode }) {

    const context = useFireCMSContext();
    const navigationContext = useNavigationContext();
    const userConfigurationPersistence = useUserConfigurationPersistence();

    if (!navigationContext.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    const {
        navigationEntries,
        groups
    } = navigationContext.topLevelNavigation;

    const [filteredUrls, setFilteredUrls] = useState<string[] | null>(null);

    const filteredNavigationEntries = filteredUrls
        ? navigationEntries.filter((entry) => filteredUrls.includes(entry.url))
        : navigationEntries;

    useEffect(() => {
        filteredNavigationEntries.forEach((entry) => {
            // @ts-ignore
            searchIndex.addAsync(entry.url, `${entry.name} ${entry.description} ${entry.group} ${entry.path}`);
        })
    }, [navigationEntries]);

    const updateSearchResults = useCallback(
        (value?: string) => {
            if (!value || value === "") {
                setFilteredUrls(null);
            } else {
                // @ts-ignore
                searchIndex.searchAsync(value).then((results) => {
                    setFilteredUrls(results);
                });
            }
        }, []);

    const allGroups: Array<string | undefined> = [...groups];
    if (filteredNavigationEntries.filter(e => !e.group).length > 0 || filteredNavigationEntries.length === 0) {
        allGroups.push(undefined);
    }

    let additionalSections: React.ReactNode | undefined;
    if (context.plugins) {
        const sectionProps: PluginGenericProps = {
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
        <Container sx={{ my: 2 }}>

            <Box sx={{
                position: "sticky",
                py: 2,
                top: 0,
                zIndex: 10
            }}>
                <SearchBar onTextSearch={updateSearchResults}
                           placeholder={"Search collections"}
                           large={true}/>
            </Box>

            <FavouritesView/>

            {allGroups.map((group, index) => {

                const AdditionalCards: React.ComponentType<PluginHomePageAdditionalCardsProps>[] = [];
                const actionProps: PluginHomePageAdditionalCardsProps = {
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

                const thisGroupCollections = filteredNavigationEntries
                    .filter((entry) => entry.group === group || (!entry.group && group === undefined));
                if (thisGroupCollections.length === 0 && AdditionalCards.length === 0)
                    return null;
                return (
                    <NavigationGroup
                        group={group}
                        key={`plugin_section_${group}`}>
                        <Grid container spacing={2}>
                            {thisGroupCollections // so we don't miss empty groups
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
                    </NavigationGroup>
                );
            })}

            {additionalSections}

            {additionalChildren}

        </Container>
    );
}
