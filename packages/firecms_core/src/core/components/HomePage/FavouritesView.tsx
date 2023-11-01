import { useNavigate } from "react-router-dom";
import { useNavigationContext } from "../../../hooks";
import { useUserConfigurationPersistence } from "../../../hooks/useUserConfigurationPersistence";
import { TopNavigationEntry } from "../../../types";
import { Chip, Collapse } from "../../../components";
import { StarBorderIcon, StarIcon } from "../../../icons";

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
        onClick={() => navigate(entry.url)}
        icon={
            favourite
                ? <StarIcon
                    onClick={onIconClick}
                    size={18}
                    className={"text-secondary"}/>
                : <StarBorderIcon
                    onClick={onIconClick}
                    size={18}
                    className={"text-gray-400 dark:text-gray-500"}/>}>
        {entry.name}
    </Chip>;
}

export function FavouritesView({ hidden }: { hidden: boolean }) {

    const navigationContext = useNavigationContext();
    const userConfigurationPersistence = useUserConfigurationPersistence();

    if (!userConfigurationPersistence)
        return null;

    const favouriteCollections = (userConfigurationPersistence?.favouritePaths ?? [])
        .map((path) => navigationContext.topLevelNavigation?.navigationEntries.find((entry) => entry.path === path))
        .filter(Boolean) as TopNavigationEntry[];

    return <Collapse in={favouriteCollections.length > 0}>
        <div className="flex flex-row flex-wrap gap-2 pb-2 min-h-[32px]">
            {favouriteCollections.map((entry) => <NavigationChip key={entry.path}
                                                                 entry={entry}/>)}
        </div>
    </Collapse>;
}
