import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Popover,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

import {
    AnyProperty,
    CollectionSize,
    Entity,
    EntityCollection,
    SelectionController
} from "../../models";
import { CollectionTable, OnColumnResizeParams } from "./CollectionTable";

import { CollectionRowActions } from "./CollectionTable/internal/CollectionRowActions";
import { DeleteEntityDialog } from "./CollectionTable/internal/DeleteEntityDialog";
import { ExportButton } from "./CollectionTable/internal/ExportButton";

import { canCreate, canDelete, canEdit } from "../util/permissions";
import { Markdown } from "../../preview";
import {
    useAuthController,
    useFireCMSContext,
    useSideEntityController
} from "../../hooks";
import {
    PartialEntityCollection,
    getCollectionConfig,
    saveCollectionConfig
} from "../util/storage";
import { mergeDeep } from "../util/objects";

/**
 * @category Components
 */
export interface EntityCollectionViewProps<M extends { [Key: string]: any }> {

    /**
     * Absolute path this collection view points to
     */
    path: string;

    /**
     * Entity collection props
     */
    collection: EntityCollection<M>;

}


export function useSelectionController<M = any>(): SelectionController {

    const [selectedEntities, setSelectedEntities] = useState<Entity<M>[]>([]);

    const toggleEntitySelection = (entity: Entity<M>) => {
        let newValue;
        if (selectedEntities.map(e => e.id).includes(entity.id)) {
            newValue = selectedEntities.filter((item: Entity<M>) => item.id !== entity.id);
        } else {
            newValue = [...selectedEntities, entity];
        }
        setSelectedEntities(newValue);
    };

    const isEntitySelected = (entity: Entity<M>) => selectedEntities.map(e => e.id).includes(entity.id);

    return {
        selectedEntities,
        setSelectedEntities,
        isEntitySelected,
        toggleEntitySelection
    };
}

/**
 * This component is in charge of binding a datasource path with an {@link EntityCollection}
 * where it's configuration is defined. It includes an infinite scrolling table,
 * 'Add' new entities button,
 *
 * This component is the default one used for displaying entity collections
 * and is in charge of generating all the specific actions and customization
 * of the lower level {@link CollectionTable}
 *
 * Please **note** that you only need to use this component if you are building
 * a custom view. If you just need to create a default view you can do it
 * exclusively with config options.
 *
 * If you need a lower level implementation with more granular options, you
 * can try {@link CollectionTable}.
 *
 * If you need a table that is not bound to the datasource or entities and
 * properties at all, you can check {@link Table}
 *
 * @param path
 * @param collectionConfig
 * @constructor
 * @category Components
 */
export function EntityCollectionView<M extends { [Key: string]: any }>({
                                                                           path,
                                                                           collection: baseCollection
                                                                       }: EntityCollectionViewProps<M>
) {

    const sideEntityController = useSideEntityController();
    const context = useFireCMSContext();
    const authController = useAuthController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);
    const [extraConfiguration, setExtraConfiguration] = useState<PartialEntityCollection<M>>(getCollectionConfig(path));

    const collection: EntityCollection = useMemo(() => mergeDeep(baseCollection, extraConfiguration), [baseCollection, extraConfiguration]);

    const exportable = collection.exportable === undefined || collection.exportable;

    const selectionEnabled = collection.selectionEnabled === undefined || collection.selectionEnabled;
    const hoverRow = collection.inlineEditing !== undefined && !collection.inlineEditing;

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const selectionController = collection.selectionController ?? useSelectionController<M>();
    const {
        selectedEntities,
        toggleEntitySelection,
        isEntitySelected,
        setSelectedEntities
    } = selectionController;

    useEffect(() => {
        setDeleteEntityClicked(undefined);
    }, [selectedEntities]);

    const onEntityClick = (entity: Entity<M>) => {
        return sideEntityController.open({
            entityId: entity.id,
            path,
            permissions: collection.permissions,
            schema: collection.schema,
            subcollections: collection.subcollections,
            callbacks: collection.callbacks,
            overrideSchemaResolver: false
        });
    };

    const onNewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        return sideEntityController.open({
            path,
            permissions: collection.permissions,
            schema: collection.schema,
            subcollections: collection.subcollections,
            callbacks: collection.callbacks,
            overrideSchemaResolver: false
        });
    };

    const internalOnEntityDelete = (path: string, entity: Entity<M>) => {
        setSelectedEntities(selectedEntities.filter((e) => e.id !== entity.id));
    };

    const internalOnMultipleEntitiesDelete = (path: string, entities: Entity<M>[]) => {
        setSelectedEntities([]);
        setDeleteEntityClicked(undefined);
    };

    const checkInlineEditing = (entity: Entity<any>) => {
        if (!canEdit(collection.permissions, entity, authController, path, context)) {
            return false;
        }
        return collection.inlineEditing === undefined || collection.inlineEditing;
    };


    const onColumnResize = ({ width, key }: OnColumnResizeParams) => {
        const property: Partial<AnyProperty> = { columnWidth: width };
        const newCollection: PartialEntityCollection<M> = mergeDeep(extraConfiguration, { schema: { properties: { [key as keyof M]: property } } });
        setExtraConfiguration(newCollection);
        saveCollectionConfig(path, newCollection);
    };

    const onSizeChanged = (size: CollectionSize) => {
        const newCollection: PartialEntityCollection<M> = mergeDeep(extraConfiguration, { defaultSize: size });
        setExtraConfiguration(newCollection);
        saveCollectionConfig(path, newCollection);
    };

    const open = anchorEl != null;
    const title = (
        <div style={{
            padding: "4px"
        }}>

            <Typography
                variant="h6"
                style={{
                    lineHeight: "1.0",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    maxWidth: "160px",
                    cursor: collection.description ? "pointer" : "inherit"
                }}
                onClick={collection.description ? (e) => {
                    setAnchorEl(e.currentTarget);
                    e.stopPropagation();
                } : undefined}
            >
                {`${collection.name}`}
            </Typography>
            <Typography
                style={{
                    display: "block",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    maxWidth: "160px",
                    direction: "rtl",
                    textAlign: "left"
                }}
                variant={"caption"}
                color={"textSecondary"}>
                {`/${path}`}
            </Typography>

            {collection.description &&
            <Popover
                id={"info-dialog"}
                open={open}
                anchorEl={anchorEl}
                elevation={1}
                onClose={() => {
                    setAnchorEl(null);
                }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
            >

                <Box m={2}>
                    <Markdown source={collection.description}/>
                </Box>

            </Popover>
            }

        </div>
    );

    const tableRowActionsBuilder = ({
                                        entity,
                                        size
                                    }: { entity: Entity<any>, size: CollectionSize }) => {

        const isSelected = isEntitySelected(entity);

        const createEnabled = canCreate(collection.permissions, authController, path, context);
        const editEnabled = canEdit(collection.permissions, entity, authController, path, context);
        const deleteEnabled = canDelete(collection.permissions, entity, authController, path, context);

        const onCopyClicked = (entity: Entity<M>) => sideEntityController.open({
            entityId: entity.id,
            path,
            copy: true,
            permissions: {
                edit: editEnabled,
                create: createEnabled,
                delete: deleteEnabled
            },
            schema: collection.schema,
            subcollections: collection.subcollections,
            callbacks: collection.callbacks,
            overrideSchemaResolver: false
        });

        const onEditClicked = (entity: Entity<M>) => sideEntityController.open({
            entityId: entity.id,
            path,
            permissions: {
                edit: editEnabled,
                create: createEnabled,
                delete: deleteEnabled
            },
            schema: collection.schema,
            subcollections: collection.subcollections,
            callbacks: collection.callbacks,
            overrideSchemaResolver: false
        });

        return (
            <CollectionRowActions
                entity={entity}
                isSelected={isSelected}
                selectionEnabled={selectionEnabled}
                size={size}
                toggleEntitySelection={toggleEntitySelection}
                onEditClicked={onEditClicked}
                onCopyClicked={createEnabled ? onCopyClicked : undefined}
                onDeleteClicked={deleteEnabled ? setDeleteEntityClicked : undefined}
            />
        );

    };

    function toolbarActionsBuilder(_: { size: CollectionSize, data: Entity<any>[] }) {

        const addButton = canCreate(collection.permissions, authController, path, context) && onNewClick && (largeLayout ?
            <Button
                onClick={onNewClick}
                startIcon={<Add/>}
                size="large"
                variant="contained"
                color="primary">
                Add {collection.schema.name}
            </Button>
            : <Button
                onClick={onNewClick}
                size="medium"
                variant="contained"
                color="primary"
            >
                <Add/>
            </Button>);

        const multipleDeleteEnabled = selectedEntities.every((entity) => canDelete(collection.permissions, entity, authController, path, context));
        const onMultipleDeleteClick = (event: React.MouseEvent) => {
            event.stopPropagation();
            setDeleteEntityClicked(selectedEntities);
        };
        const multipleDeleteButton = selectionEnabled &&

            <Tooltip
                title={multipleDeleteEnabled ? "Multiple delete" : "You have selected one entity you cannot delete"}>
                <span>
                    {largeLayout && <Button
                        disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                        startIcon={<Delete/>}
                        onClick={onMultipleDeleteClick}
                        color={"primary"}
                    >
                        <p style={{ minWidth: 24 }}>({selectedEntities?.length})</p>
                    </Button>}

                    {!largeLayout &&
                    <IconButton
                        color={"primary"}
                        disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                        onClick={onMultipleDeleteClick}
                        size="large">
                        <Delete/>
                    </IconButton>}
                </span>
            </Tooltip>;

        const extraActions = collection.extraActions ? collection.extraActions({
            path,
            collection,
            selectionController,
            context
        }) : undefined;

        const exportButton = exportable &&
            <ExportButton schema={collection.schema}
                          exportConfig={typeof collection.exportable === "object" ? collection.exportable : undefined}
                          path={path}/>;

        return (
            <>
                {extraActions}
                {multipleDeleteButton}
                {exportButton}
                {addButton}
            </>
        );
    }

    return (
        <>

            <CollectionTable
                title={title}
                path={path}
                collection={collection}
                onSizeChanged={onSizeChanged}
                inlineEditing={checkInlineEditing}
                onEntityClick={onEntityClick}
                onColumnResize={onColumnResize}
                tableRowActionsBuilder={tableRowActionsBuilder}
                toolbarActionsBuilder={toolbarActionsBuilder}
                hoverRow={hoverRow}
            />

            <DeleteEntityDialog entityOrEntitiesToDelete={deleteEntityClicked}
                                path={path}
                                schema={collection.schema}
                                callbacks={collection.callbacks}
                                open={!!deleteEntityClicked}
                                onEntityDelete={internalOnEntityDelete}
                                onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                                onClose={() => setDeleteEntityClicked(undefined)}/>
        </>
    );
}

