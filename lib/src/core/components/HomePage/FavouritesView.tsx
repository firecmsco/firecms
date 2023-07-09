import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { useFireCMSContext, useNavigationContext } from "../../../hooks";
import { useUserConfigurationPersistence } from "../../../hooks/useUserConfigurationPersistence";
import { TopNavigationEntry } from "../../../types";

import { NavigationGroup } from "./NavigationGroup";
import { NavigationCollectionCard } from "./NavigationCollectionCard";
import { Chip } from "../../../components";
import { Collapse } from "../../../components/Collapse";

function NavigationChip({ entry }: { entry: TopNavigationEntry }) {

    const navigate = useNavigate();
    const userConfigurationPersistence = useUserConfigurationPersistence();

    if (!userConfigurationPersistence)
        return null;

    const favourite = userConfigurationPersistence.favouritePaths.includes(entry.path);
    const onIconClick = (e: React.SyntheticEvent) => {
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
    };
    return <Chip
        key={entry.path}
        label={entry.name}
        onClick={() => navigate(entry.url)}
        icon={
            <Star strokeWidth={favourite ? 2 : 2}
                  onClick={onIconClick}
                  size={18}
                  className={favourite ? "text-secondary" : "text-gray-400 dark:text-gray-500"}/>}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favouriteCollections.map((entry) => (
                    <div key={`nav_${entry.group}_${entry.name}`} className="col-span-1">
                        <NavigationCollectionCard
                            {...entry}
                            onClick={() => {
                                const event =
                                    entry.type === "collection"
                                        ? "home_favorite_navigate_to_collection"
                                        : entry.type === "view"
                                            ? "home_favorite_navigate_to_view"
                                            : "unmapped_event";
                                context.onAnalyticsEvent?.(event, { path: entry.path });
                            }}
                        />
                    </div>
                ))}
            </div>
        </NavigationGroup>
    </Collapse>;

    return <>
        <div className="flex flex-row flex-wrap gap-1 pb-2">
            {recentCollections.map((entry) => <NavigationChip key={entry.path}
                                                              entry={entry}/>)}
        </div>
        {favouritesGroup}
    </>;
}
