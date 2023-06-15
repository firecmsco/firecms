import { CardActionArea, CardActions, CardContent, IconButton, Paper } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";

import { useNavigate } from "react-router-dom";

import { Markdown } from "../../../preview";
import { useFireCMSContext } from "../../../hooks";
import { PluginHomePageActionsProps, TopNavigationEntry } from "../../../types";
import { getIconForView } from "../../util";
import { useUserConfigurationPersistence } from "../../../hooks/useUserConfigurationPersistence";
import TTypography from "../../../components/TTypography";

/**
 * This is the component used in the home page to render a card for each
 * collection.
 * @category Components
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
    const CollectionIcon = getIconForView(collection ?? view);

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
        <Paper elevation={0} className="h-full">

            <CardActionArea
                component={"div"}
                className="flex flex-col items-start min-h-[248px] h-full"
                onClick={() => {
                    onClick?.();
                    navigate(url);
                    if (userConfigurationPersistence) {
                        userConfigurationPersistence.setRecentlyVisitedPaths(
                            [path, ...(userConfigurationPersistence.recentlyVisitedPaths ?? []).filter(p => p !== path)]
                        );
                    }
                }}
            >
                <CardContent
                    className="flex-grow w-full">

                    <div
                        className="h-10 flex items-center w-full justify-between">

                        <CollectionIcon color={"disabled"}/>

                        <div
                            className="flex items-center gap-1"
                            onClick={(event: React.MouseEvent) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}>
                            {actions}
                            {userConfigurationPersistence &&
                                <IconButton size={"small"}
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
                                    {favourite
                                        ? <StarIcon color={"secondary"}/>
                                        : <StarBorderIcon color={"disabled"}/>}
                                </IconButton>}
                        </div>

                    </div>

                    <TTypography gutterBottom variant="h5"
                                 component="h2">
                        {name}
                    </TTypography>

                    {description && <TTypography variant="body2"
                                                 color="secondary"
                                                 component="div">
                        <Markdown source={description}/>
                    </TTypography>}
                </CardContent>

                <CardActions style={{ alignSelf: "flex-end" }}>

                    <div className={"p-4"}>
                        <ArrowForwardIcon color="primary"/>
                    </div>
                </CardActions>

            </CardActionArea>

        </Paper>)
        ;
}
