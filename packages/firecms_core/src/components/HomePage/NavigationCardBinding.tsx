import { useNavigate } from "react-router-dom";

import { useCustomizationController, useFireCMSContext } from "../../hooks";
import { PluginHomePageActionsProps, NavigationEntry } from "../../types";
import { IconForView } from "../../util";
import { useUserConfigurationPersistence } from "../../hooks/useUserConfigurationPersistence";
import { IconButton, StarIcon } from "@firecms/ui";
import { NavigationCard } from "./NavigationCard";
import { SmallNavigationCard } from "./SmallNavigationCard";
import React from "react";

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

 */
export function NavigationCardBinding({
                                          path,
                                          collection,
                                          view,
                                          url,
                                          name,
                                          description,
                                          onClick,
                                          type
                                      }: NavigationEntry & {
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
                size={"small"}
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
                <StarIcon
                    size={"small"}
                    className={favourite ? "text-secondary" : "text-surface-400 dark:text-surface-500"}/>
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

    if (type === "admin") {
        return <SmallNavigationCard icon={collectionIcon}
                                    name={name}
                                    url={url}/>
    }

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
