import { useNavigate } from "react-router-dom";

import { useFireCMSContext } from "../../hooks";
import { PluginHomePageActionsProps, TopNavigationEntry } from "../../types";
import { getIconForView } from "../../util";
import { useUserConfigurationPersistence } from "../../hooks/useUserConfigurationPersistence";
import { Card, cn, IconButton, Markdown, Typography } from "../../ui";
import { ArrowForwardIcon, StarBorderIcon, StarIcon } from "../../icons";

/**
 * This is the component used in the home page to render a card for each
 * collection.
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
export function NavigationCollectionCard({
                                             view,
                                             path,
                                             collection,
                                             url,
                                             name,
                                             description,
                                             onClick
                                         }: TopNavigationEntry & {
    onClick?: () => void
}) {

    const userConfigurationPersistence = useUserConfigurationPersistence();
    const collectionIcon = getIconForView(collection ?? view);

    const navigate = useNavigate();
    const context = useFireCMSContext();

    const favourite = (userConfigurationPersistence?.favouritePaths ?? []).includes(path);

    let actions: React.ReactNode | undefined;
    if (context.plugins && collection) {
        const actionProps: PluginHomePageActionsProps = {
            path,
            collection,
            context
        };
        actions = <>
            {context.plugins.map((plugin, i) => (
                plugin.homePage?.CollectionActions
                    ? <plugin.homePage.CollectionActions
                        key={`actions_${i}`}
                        {...actionProps}
                        extraProps={plugin.homePage.extraProps}
                    />
                    : null
            ))}
        </>
        ;
    }

    return (
        <Card
            className={cn("h-full p-4 cursor-pointer min-h-[230px]")}
            onClick={() => {
                onClick?.();
                navigate(url);
                if (userConfigurationPersistence) {
                    userConfigurationPersistence.setRecentlyVisitedPaths(
                        [path, ...(userConfigurationPersistence.recentlyVisitedPaths ?? []).filter(p => p !== path)]
                    );
                }
            }}>

            <div className="flex flex-col items-start h-full">
                <div
                    className="flex-grow w-full">

                    <div
                        className="h-10 flex items-center w-full justify-between text-gray-300 dark:text-gray-600">

                        {collectionIcon}

                        <div
                            className="flex items-center gap-1"
                            onClick={(event: React.MouseEvent) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}>

                            {actions}

                            {userConfigurationPersistence &&
                                <IconButton
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
                                </IconButton>}

                        </div>

                    </div>

                    <Typography gutterBottom variant="h5"
                                component="h2">
                        {name}
                    </Typography>

                    {description && <Typography variant="body2"
                                                color="secondary"
                                                component="div">
                        <Markdown source={description}/>
                    </Typography>}
                </div>

                <div style={{ alignSelf: "flex-end" }}>

                    <div className={"p-4"}>
                        <ArrowForwardIcon className="text-primary"/>
                    </div>
                </div>

            </div>

        </Card>);
}
