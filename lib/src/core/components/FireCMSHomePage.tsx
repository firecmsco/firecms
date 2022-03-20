import { useCallback, useState } from "react";
import {
    Box,
    CardActionArea,
    CardActions,
    CardContent,
    Container,
    Divider,
    Grid,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import EditIcon from "@mui/icons-material/Edit";

import { Link as ReactLink } from "react-router-dom";

import { Markdown } from "../../preview";
import { useNavigationContext } from "../../hooks";
import {
    useConfigurationPersistence
} from "../../hooks/useConfigurationPersistence";
import Delete from "@mui/icons-material/Delete";
import { MoreVert } from "@mui/icons-material";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { TopNavigationEntry, TopNavigationResult } from "../../models";
import { SchemaEditorDialog } from "../../schema_editor/SchemaEditorDialog";
import {
    NewSchemaEditorDialog,
    NewSchemaEditorDialogProps
} from "../../schema_editor/NewSchemaEditorDialog";

/**
 * Default entry view for the CMS under the path "/"
 * This component takes navigation as an input and renders cards
 * for each entry, including title and description.
 * @constructor
 * @category Components
 */
export function FireCMSHomePage() {

    const navigationContext = useNavigationContext();
    const configurationPersistence = useConfigurationPersistence();
    const configurationPersistenceEnabled = Boolean(configurationPersistence);

    const [newSchemaDialogOpen, setNewSchemaDialogOpen] = useState<Partial<NewSchemaEditorDialogProps> | undefined>();
    const [editSelectedPath, setEditSelectedPath] = useState<string | undefined>();

    if (!navigationContext.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    const navigationResult: TopNavigationResult = navigationContext.topLevelNavigation;
    const [collectionToBeDeleted, setCollectionToBeDeleted] = useState<TopNavigationEntry | undefined>();

    const onEditCollectionClicked = useCallback((entry: TopNavigationEntry) => {
        setEditSelectedPath(entry.path);
    }, []);
    const onDeleteCollectionClicked = useCallback((entry: TopNavigationEntry) => {
        setCollectionToBeDeleted(entry);
    }, []);

    const deleteCollection = useCallback(() => {
        if (collectionToBeDeleted?.path) {
            configurationPersistence?.deleteCollection(collectionToBeDeleted.path);
        }
        setCollectionToBeDeleted(undefined);
    }, [collectionToBeDeleted]);

    const {
        navigationEntries,
        groups
    } = navigationResult;

    const allGroups: Array<string | undefined> = [...groups];
    if (configurationPersistenceEnabled || navigationEntries.filter(e => !e.group).length > 0) {
        allGroups.push(undefined);
    }

    function buildAddCollectionNavigationCard(group?: string) {
        return (
            <Grid item xs={12}
                  sm={6}
                  md={4}
                  key={`nav_${group}_"add`}>
                <Paper variant={"outlined"}
                       sx={{ height: "100%", minHeight: 124 }}>
                    <CardActionArea
                        sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start"
                        }}
                        onClick={() => setNewSchemaDialogOpen({
                            open: true,
                            group
                        })}
                    >

                        <CardContent
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                width: "100%",
                                flexGrow: 1
                            }}>
                            <AddIcon color="primary"/>
                        </CardContent>

                    </CardActionArea>
                </Paper>
            </Grid>
        );
    }

    return (
        <Container>
            {allGroups.map((group, index) => (
                <Box mt={6} mb={6} key={`group_${index}`}>

                    <Typography color={"textSecondary"}
                                className={"weight-500"}>
                        {group?.toUpperCase() ?? "Ungrouped views".toUpperCase()}
                    </Typography>

                    <Divider/>

                    <Box mt={2}>
                        <Grid container spacing={2}>
                            {navigationEntries
                                .filter((entry) => entry.group === group || (!entry.group && group === undefined)) // so we don't miss empty groups
                                .map((entry) =>
                                    <Grid item xs={12}
                                          sm={6}
                                          md={4}
                                          key={`nav_${entry.group}_${entry.name}`}>
                                        <NavigationCard entry={entry}
                                                        onEdit={configurationPersistenceEnabled && entry.editable
                                                            ? onEditCollectionClicked
                                                            : undefined}
                                                        onDelete={configurationPersistenceEnabled && entry.deletable
                                                            ? onDeleteCollectionClicked
                                                            : undefined}/>
                                    </Grid>)
                            }
                            {buildAddCollectionNavigationCard(group)}
                        </Grid>
                    </Box>
                </Box>
            ))}

            <DeleteConfirmationDialog
                open={Boolean(collectionToBeDeleted)}
                onAccept={deleteCollection}
                onCancel={() => setCollectionToBeDeleted(undefined)}
                title={<>Delete this collection?</>}
                body={<> This will <b>not
                    delete any data</b>, only
                    the collection in the CMS</>}/>

            <SchemaEditorDialog open={Boolean(editSelectedPath)}
                                handleClose={(schema) => {
                                    setEditSelectedPath(undefined);
                                }}
                                path={editSelectedPath as string}/>

            <NewSchemaEditorDialog
                open={false}
                {...newSchemaDialogOpen}
                handleClose={(schema) => {
                    setNewSchemaDialogOpen({ open: false });
                }}/>

        </Container>
    );
}

type NavigationCardProps = {
    entry: TopNavigationEntry,
    onDelete: ((entry: TopNavigationEntry) => void) | undefined,
    onEdit: ((entry: TopNavigationEntry) => void) | undefined
};

function NavigationCard({ entry, onDelete, onEdit }: NavigationCardProps) {

    const [menuAnchorEl, setMenuAnchorEl] = useState<any | null>(null);

    const menuOpen = Boolean(menuAnchorEl);

    return (
        <Paper variant={"outlined"}>

            <CardActionArea
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minHeight: 248
                }}
                disableRipple={menuOpen}
                component={ReactLink}
                to={entry.url}
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

                        {entry.type === "view" &&
                            <ShowChartIcon color={"disabled"}/>}
                        {entry.type !== "view" &&
                            <PlaylistPlayIcon color={"disabled"}/>}
                        <div>
                            {onDelete &&
                                <IconButton
                                    onClick={(event: React.MouseEvent) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setMenuAnchorEl(event.currentTarget);
                                    }}>
                                    <MoreVert/>
                                </IconButton>
                            }

                            {onEdit &&
                                <IconButton
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        if (onEdit)
                                            onEdit(entry);
                                    }}>
                                    <EditIcon/>
                                </IconButton>}
                        </div>
                    </Box>

                    <Typography gutterBottom variant="h5"
                                component="h2">
                        {entry.name}
                    </Typography>

                    {entry.description && <Typography variant="body2"
                                                      color="textSecondary"
                                                      component="div">
                        <Markdown source={entry.description}/>
                    </Typography>}
                </CardContent>

                <CardActions style={{ alignSelf: "flex-end" }}>

                    <Box p={1}>
                        <ArrowForwardIcon color="primary"/>
                    </Box>
                </CardActions>

            </CardActionArea>

            <Menu
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={() => setMenuAnchorEl(null)}
                elevation={2}
            >
                {onDelete && <MenuItem onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onDelete(entry);
                    setMenuAnchorEl(undefined);
                }}>
                    <ListItemIcon>
                        <Delete/>
                    </ListItemIcon>
                    <ListItemText primary={"Delete"}/>
                </MenuItem>}

            </Menu>

        </Paper>);
}
