import { useNavigate } from "react-router-dom";
import { Box, Chip, Collapse, Grid } from "@mui/material";
import { useFireCMSContext, useNavigationContext } from "../../../hooks";
import {
    useUserConfigurationPersistence
} from "../../../hooks/useUserConfigurationPersistence";
import { TopNavigationEntry } from "../../../types";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { NavigationGroup } from "./NavigationGroup";
import { NavigationCollectionCard } from "./NavigationCollectionCard";

function NavigationChip({ entry }: { entry: TopNavigationEntry }) {

    const navigate = useNavigate();
    const userConfigurationPersistence = useUserConfigurationPersistence();

    if (!userConfigurationPersistence)
        return null;

    const favourite = userConfigurationPersistence.favouritePaths.includes(entry.path);
    return <Chip
        key={entry.path}
        label={entry.name}
        onClick={() => navigate(entry.url)}
        onDelete={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (favourite) {
                userConfigurationPersistence.setFavouritePaths(
                    userConfigurationPersistence.favouritePaths.filter(p => p !== entry.path)
                );
            } else {
                userConfigurationPersistence.setFavouritePaths(
                    [...userConfigurationPersistence.favouritePaths, entry.path]
                );
            }
        }}
        deleteIcon={favourite
            ? <StarIcon color={"secondary"}/>
            : <StarBorderIcon color={"disabled"}/>}
    />;
}

export function FavouritesView({ hidden }: { hidden: boolean }) {

    const context = useFireCMSContext();
    const navigationContext = useNavigationContext();
    const userConfigurationPersistence = useUserConfigurationPersistence();

    if (!userConfigurationPersistence)
        return null;

    const favouriteCollections = (userConfigurationPersistence?.favouritePaths ?? [])
        .map((path) => navigationContext.topLevelNavigation?.navigationEntries.find((entry) => entry.path === path))
        .filter(Boolean) as TopNavigationEntry[];

    const recentCollections = ((userConfigurationPersistence?.recentlyVisitedPaths ?? [])
        .map((path) => navigationContext.topLevelNavigation?.navigationEntries.find((entry) => entry.path === path))
        .filter(Boolean) as TopNavigationEntry[])
        .slice(0, 5);

    const favouritesGroup = <Collapse
        in={!hidden && favouriteCollections.length > 0}>
        <NavigationGroup group={"Favourites"}>
            <Grid container spacing={2}>
                {favouriteCollections
                    .map((entry) =>
                        <Grid item
                              xs={12}
                              sm={6}
                              lg={4}
                              key={`nav_${entry.group}_${entry.name}`}>
                            <NavigationCollectionCard {...entry}
                                                      onClick={() => {
                                                          const event = entry.type === "collection" ? "home_favorite_navigate_to_collection" : (entry.type === "view" ? "home_favorite_navigate_to_view" : "unmapped_event");
                                                          context.onAnalyticsEvent?.(event, { path: entry.path });
                                                      }}/>
                        </Grid>)
                }

            </Grid>
        </NavigationGroup>
    </Collapse>;

    return <Box>
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 1,
            pb: 2
        }}>
            {recentCollections.map((entry) => <NavigationChip key={entry.path}
                                                              entry={entry}/>)}
        </Box>
        {favouritesGroup}
    </Box>;
}
