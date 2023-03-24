import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import { useNavigationContext } from "../../../hooks";
import {
    useUserConfigurationPersistence
} from "../../../hooks/useUserConfigurationPersistence";
import { TopNavigationEntry } from "../../../types";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";

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

export function FavouritesView() {
    const navigationContext = useNavigationContext();
    const userConfigurationPersistence = useUserConfigurationPersistence();

    if (!userConfigurationPersistence)
        return null;

    const favouriteCollections = (userConfigurationPersistence?.favouritePaths ?? [])
        .map((path) => navigationContext.topLevelNavigation?.navigationEntries.find((entry) => entry.path === path))
        .filter(Boolean) as TopNavigationEntry[];
    const favouritePaths = favouriteCollections.map(e => e.path);
    const recentCollections = ((userConfigurationPersistence?.recentlyVisitedPaths ?? [])
        .map((path) => navigationContext.topLevelNavigation?.navigationEntries.find((entry) => entry.path === path))
        .filter(Boolean) as TopNavigationEntry[])
        .filter(entry => !favouritePaths.includes(entry.path))
        .slice(0, 5);

    return <Box sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 1,
        pb: 2
    }}>
        {favouriteCollections.map((entry) => <NavigationChip key={entry.path}
                                                             entry={entry}/>)}
        {recentCollections.map((entry) => <NavigationChip key={entry.path}
                                                          entry={entry}/>)}
    </Box>;
}
