import {
    Box,
    CardActionArea,
    CardActions,
    CardContent,
    Paper,
    Typography
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { Link as ReactLink, useNavigate } from "react-router-dom";

import { Markdown } from "../../../preview";
import { useFireCMSContext } from "../../../hooks";
import { HomePageActionsProps, TopNavigationEntry } from "../../../types";
import { getIconForView } from "../../util";

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
 * @constructor
 */
export function NavigationCollectionCard({
                                             view,
                                             path,
                                             collection,
                                             url,
                                             name,
                                             description
                                         }: TopNavigationEntry) {

    const CollectionIcon = getIconForView(collection ?? view);

    const navigate = useNavigate();
    const context = useFireCMSContext();

    let actions: React.ReactNode | undefined;
    if (context.plugins && collection) {
        const actionProps: HomePageActionsProps = {
            path,
            collection,
            context
        };
        actions = <>
            {context.plugins.map((plugin, i) => (
                plugin.homePage?.CollectionActions
                    ? <plugin.homePage.CollectionActions
                        key={`actions_${i}`} {...actionProps}/>
                    : null
            ))}
        </>
        ;
    }

    return (
        <Paper variant={"outlined"}>

            <CardActionArea
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minHeight: 248
                }}
                onClick={() => {
                    navigate(url);
                }}
                // component={"div"}
                // to={url}
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
                        <div onClick={(event: React.MouseEvent) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}>
                            {actions}
                        </div>

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

        </Paper>);
}
