import type { NavigationEntry } from "@rebasepro/types";
import { useNavigate } from "react-router-dom";
;
import { Chip, Collapse, StarIcon } from "@rebasepro/ui";
import { useUserConfigurationPersistence } from "@rebasepro/core";
import { useNavigationStateController } from "../../index";

function NavigationChip({ entry }: { entry: NavigationEntry }) {

    const navigate = useNavigate();
    const userConfigurationPersistence = useUserConfigurationPersistence();

    if (!userConfigurationPersistence)
        return null;

    const favourite = userConfigurationPersistence.favouritePaths.includes(entry.slug);
    const onIconClick = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (favourite) {
            userConfigurationPersistence.setFavouritePaths(
                userConfigurationPersistence.favouritePaths.filter(p => p !== entry.slug)
            );
        } else {
            userConfigurationPersistence.setFavouritePaths(
                [...userConfigurationPersistence.favouritePaths, entry.slug]
            );
        }
    };
    return <Chip
        key={entry.slug}
        onClick={() => navigate(entry.url)}
        icon={<StarIcon
            onClick={onIconClick}
            size={18}
            className={favourite ? "text-secondary" : "text-surface-400 dark:text-surface-500"} />
        }>
        {entry.name}
    </Chip>;
}

export function FavouritesView({ hidden }: { hidden: boolean }) {

    const navigationStateController = useNavigationStateController();
    const userConfigurationPersistence = useUserConfigurationPersistence();

    if (!userConfigurationPersistence)
        return null;

    const favouriteCollections = (userConfigurationPersistence?.favouritePaths ?? [])
        .map((path) => navigationStateController.topLevelNavigation?.navigationEntries.find((entry) => entry.slug === path))
        .filter(Boolean) as NavigationEntry[];

    return <Collapse in={favouriteCollections.length > 0}>
        <div className="flex flex-row flex-wrap gap-2 pb-2 min-h-[32px]">
            {favouriteCollections.map((entry) => <NavigationChip key={entry.slug}
                entry={entry} />)}
        </div>
    </Collapse>;
}
