import { useNavigate } from "react-router-dom";

import { useCustomizationController, useFireCMSContext } from "../../hooks";
import { PluginHomePageActionsProps, TopNavigationEntry } from "../../types";
import { IconForView } from "../../util";
import { useUserConfigurationPersistence } from "../../hooks/useUserConfigurationPersistence";
import { IconButton, StarBorderIcon, StarIcon } from "@firecms/ui";
import { NavigationCard } from "./NavigationCard";

/**
 * This is the component used in the home page to render a card for each
 * collection or view.
 * @group Components
 * @param view
 * @param path
 * @param collection
 * @param url
 * @param name
 * @param description
 * @param onClick
 * @constructor
 */
export function NavigationCardBinding({
                                          path,
                                          collection,
                                          view,
                                          url,
                                          name,
                                          description,
                                          onClick
                                      }: TopNavigationEntry & {
    onClick?: () => void
}) {

    const userConfigurationPersistence = useUserConfigurationPersistence();
    const collectionIcon = <IconForView collectionOrView={collection ?? view}/>;

    const navigate = useNavigate();
    const context = useFireCMSContext();
    const customizationController = useCustomizationController();

    const favourite = (userConfigurationPersistence?.favouritePaths ?? []).includes(path);

    const actionsArray: React.ReactNode[] = userConfigurationPersistence
        ? [
            <IconButton
                key={"favourite"}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (favourite) {
                        userConfigurationPersistence.setFavouritePaths(
                            userConfigurationPersistence.favouritePaths.filter(p => p !== path)
                        );
                    } else {
                        userConfigurationPersistence.setFavouritePaths(
                            [...userConfigurationPersistence.favouritePaths, path]
                        );
                    }
                }}>
                {
                    favourite
                        ? <StarIcon
                            size={18}
                            className={"text-secondary"}/>
                        : <StarBorderIcon
                            size={18}
                            className={"text-gray-400 dark:text-gray-500"}/>}
            </IconButton>
        ]
        : [];

    if (customizationController.plugins && collection) {
        const actionProps: PluginHomePageActionsProps = {
            path,
            collection,
            context
        };
        customizationController.plugins.forEach((plugin, i) => (
            actionsArray.push(plugin.homePage?.CollectionActions
                ? <plugin.homePage.CollectionActions
                    key={`actions_${i}`}
                    {...actionProps}
                    extraProps={plugin.homePage.extraProps}
                />
                : null
            )))
    }

    const actions: React.ReactNode | undefined = <>
        {actionsArray}
    </>

    return <NavigationCard
        icon={collectionIcon}
        name={name}
        description={description}
        actions={actions}
        onClick={() => {
            onClick?.();
            navigate(url);
            if (userConfigurationPersistence) {
                userConfigurationPersistence.setRecentlyVisitedPaths(
                    [path, ...(userConfigurationPersistence.recentlyVisitedPaths ?? []).filter(p => p !== path)]
                );
            }
        }}/>;
}
