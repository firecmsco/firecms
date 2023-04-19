import {
    Box,
    CardActionArea,
    CardActions,
    CardContent,
    IconButton,
    Paper,
    Typography
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";

import { useNavigate } from "react-router-dom";

import { Markdown } from "../../../preview";
import { useFireCMSContext } from "../../../hooks";
import { PluginHomePageActionsProps, TopNavigationEntry } from "../../../types";
import { getIconForView } from "../../util";
import {
    useUserConfigurationPersistence
} from "../../../hooks/useUserConfigurationPersistence";

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
                                         }: TopNavigationEntry & { onClick?: () => void }) {

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
        <Paper elevation={0} sx={{
            height: "100%"
        }}>

            <CardActionArea
                component={"div"}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minHeight: 248,
                    height: "100%"
                }}
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
                    sx={{
                        flexGrow: 1,
                        width: "100%"
                    }}>

                    <Box sx={{
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        justifyContent: "space-between"
                    }}>

                        <CollectionIcon color={"disabled"}/>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                            }}
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
                        </Box>

                    </Box>

                    <Typography gutterBottom variant="h5"
                                component="h2">
                        {name}
                    </Typography>

                    {description && <Typography variant="body2"
                                                color="textSecondary"
                                                component="div">
                        <Markdown source={description}/>
                    </Typography>}
                </CardContent>

                <CardActions style={{ alignSelf: "flex-end" }}>

                    <Box p={1}>
                        <ArrowForwardIcon color="primary"/>
                    </Box>
                </CardActions>

            </CardActionArea>

        </Paper>)
        ;
}
