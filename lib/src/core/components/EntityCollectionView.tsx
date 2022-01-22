import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Link as ReactLink } from "react-router-dom";
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
import { Add, Delete, Settings } from "@mui/icons-material";

import {
    AnyProperty,
    CollectionSize,
    Entity,
    EntityCollection,
    EntitySchemaResolver,
    LocalEntityCollection,
    LocalEntitySchema,
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
    useNavigation,
    useSideEntityController
} from "../../hooks";
import { mergeDeep } from "../util/objects";
import { useUserConfigurationPersistence } from "../../hooks/useUserConfigurationPersistence";
import { SchemaEditorDialog } from "./SchemaEditor/SchemaEditorDialog";
import { ErrorView } from "./ErrorView";

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

    /**
     * Include an icon to be able to edit this collection
     */
    editable?: boolean;

}

export function useSelectionController<M = any>(): SelectionController {

    const [selectedEntities, setSelectedEntities] = useState<Entity<M>[]>([]);

    const toggleEntitySelection = useCallback((entity: Entity<M>) => {
        let newValue;
        if (selectedEntities.map(e => e.id).includes(entity.id)) {
            newValue = selectedEntities.filter((item: Entity<M>) => item.id !== entity.id);
        } else {
            newValue = [...selectedEntities, entity];
        }
        setSelectedEntities(newValue);
    }, [selectedEntities]);

    const isEntitySelected = useCallback((entity: Entity<M>) => selectedEntities.map(e => e.id).includes(entity.id), [selectedEntities]);

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
 * can use {@link CollectionTable}.
 *
 * If you need a table that is not bound to the datasource or entities and
 * properties at all, you can check {@link Table}
 *
 * @param path
 * @param collection
 * @constructor
 * @category Components
 */

export function EntityCollectionView<M extends { [Key: string]: unknown }>({
                                                                               path,
                                                                               collection: baseCollection,
                                                                               editable
                                                                           }: EntityCollectionViewProps<M>) {

    const navigationContext = useNavigation();
    const collectionResolver = navigationContext.getCollectionResolver<M>(path);
    if (!collectionResolver) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }

    const collection: EntityCollection<M> = collectionResolver ?? baseCollection;
    const { schemaResolver } = collectionResolver;

    if (!schemaResolver) {
        return <ErrorView
            error={"Unable to find schema with id " + collection.schemaId}/>;
    }

    return <EntityCollectionViewInternal path={path}
                                         collection={collection}
                                         schemaResolver={schemaResolver}
                                         editable={editable}/>;

}

export function EntityCollectionViewInternal<M extends { [Key: string]: unknown }>({
                                                                                       path,
                                                                                       collection,
                                                                                       editable,
                                                                                       schemaResolver
                                                                                   }: EntityCollectionViewProps<M> & { schemaResolver: EntitySchemaResolver<M> }
) {

    const sideEntityController = useSideEntityController();
    const context = useFireCMSContext();
    const authController = useAuthController();
    const navigationContext = useNavigation();
    const userConfigPersistence = useUserConfigurationPersistence();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);

    const schema = schemaResolver({});

    const schemaEditable = schema.editable ?? true;

    const exportable = collection.exportable === undefined || collection.exportable;

    const selectionEnabled = collection.selectionEnabled === undefined || collection.selectionEnabled;
    const hoverRow = schema.inlineEditing !== undefined && !schema.inlineEditing;

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [schemaDialogOpen, setSchemaDialogOpen] = useState<boolean>(false);

    const selectionController = useSelectionController<M>();
    const usedSelectionController = collection.selectionController ?? selectionController;
    const {
        selectedEntities,
        toggleEntitySelection,
        isEntitySelected,
        setSelectedEntities
    } = usedSelectionController;

    useEffect(() => {
        setDeleteEntityClicked(undefined);
    }, [selectedEntities]);

    const onEntityClick = useCallback((entity: Entity<M>) => {
        return sideEntityController.open({
            entityId: entity.id,
            path,
            permissions: collection.permissions,
            schema: schema,
            subcollections: collection.subcollections,
            callbacks: collection.callbacks,
            updateUrl: true
        });
    }, [path, collection]);

    const onNewClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        return sideEntityController.open({
            path,
            permissions: collection.permissions,
            schema: schema,
            subcollections: collection.subcollections,
            callbacks: collection.callbacks,
            updateUrl: true
        });
    }, [path, collection]);

    const internalOnEntityDelete = useCallback((_path: string, entity: Entity<M>) => {
        setSelectedEntities(selectedEntities.filter((e) => e.id !== entity.id));
    }, [selectedEntities, setSelectedEntities]);

    const internalOnMultipleEntitiesDelete = useCallback((_path: string, entities: Entity<M>[]) => {
        setSelectedEntities([]);
        setDeleteEntityClicked(undefined);
    }, [setSelectedEntities]);

    const checkInlineEditing = useCallback((entity: Entity<any>) => {
        if (!canEdit(collection.permissions, entity, authController, path, context)) {
            return false;
        }
        return schema.inlineEditing === undefined || schema.inlineEditing;
    }, [schema.inlineEditing, collection.permissions, path]);

    const onCollectionModifiedForUser = useCallback((path: string, partialCollection: LocalEntityCollection<M>) => {
        if (userConfigPersistence) {
            const currentStoredConfig = userConfigPersistence.getCollectionConfig(path);
            userConfigPersistence.onCollectionModified(path, mergeDeep(currentStoredConfig, partialCollection));
        }
    }, [userConfigPersistence]);

    const onSchemaModifiedForUser = useCallback((path: string, partialSchema: LocalEntitySchema<M>) => {
        if (userConfigPersistence) {
            const currentStoredConfig = userConfigPersistence.getSchemaConfig(path);
            userConfigPersistence.onPartialSchemaModified(path, mergeDeep(currentStoredConfig, partialSchema));
        }
    }, [userConfigPersistence]);

    const onColumnResize = useCallback(({
                                            width,
                                            key
                                        }: OnColumnResizeParams) => {
        // Only for property columns
        if (!schema.properties[key]) return;
        const property: Partial<AnyProperty> = { columnWidth: width };
        const localSchema = { properties: { [key as keyof M]: property } } as LocalEntitySchema<M>;
        onSchemaModifiedForUser(path, localSchema);
    }, [schema.properties, onCollectionModifiedForUser]);

    const onSizeChanged = useCallback((size: CollectionSize) => {
        if (userConfigPersistence)
            onSchemaModifiedForUser(path, { defaultSize: size })
    }, [onSchemaModifiedForUser]);

    const open = anchorEl != null;
    const title = useMemo(() => (
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
                onClick={collection.description
                    ? (e) => {
                        setAnchorEl(e.currentTarget);
                        e.stopPropagation();
                    }
                    : undefined}
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
    ), [collection.description, collection.name, path, open, anchorEl]);

    const tableRowActionsBuilder = useCallback(({
                                                    entity,
                                                    size
                                                }: { entity: Entity<any>, size: CollectionSize }) => {

        const isSelected = isEntitySelected(entity);

        const createEnabled = canCreate(collection.permissions, authController, path, context);
        const editEnabled = canEdit(collection.permissions, entity, authController, path, context);
        const deleteEnabled = canDelete(collection.permissions, entity, authController, path, context);

        const onCopyClicked = (clickedEntity: Entity<M>) => sideEntityController.open({
            entityId: clickedEntity.id,
            path,
            copy: true,
            permissions: {
                edit: editEnabled,
                create: createEnabled,
                delete: deleteEnabled
            },
            schema: schemaResolver,
            subcollections: collection.subcollections,
            callbacks: collection.callbacks,
            updateUrl: true
        });

        const onEditClicked = (clickedEntity: Entity<M>) => sideEntityController.open({
            entityId: clickedEntity.id,
            path,
            permissions: {
                edit: editEnabled,
                create: createEnabled,
                delete: deleteEnabled
            },
            schema: schemaResolver,
            subcollections: collection.subcollections,
            callbacks: collection.callbacks,
            updateUrl: true
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

    }, [usedSelectionController, collection.permissions, schemaResolver, authController, path]);

    const toolbarActionsBuilder = useCallback((_: { size: CollectionSize, data: Entity<any>[] }) => {

        const addButton = canCreate(collection.permissions, authController, path, context) && onNewClick && (largeLayout
            ? <Button
                onClick={onNewClick}
                startIcon={<Add/>}
                size="large"
                variant="contained"
                color="primary">
                Add {schema.name}
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

        const extraActions = collection.extraActions
            ? collection.extraActions({
                path,
                collection,
                selectionController: usedSelectionController,
                context
            })
            : undefined;

        const exportButton = exportable &&
            <ExportButton schemaResolver={schemaResolver}
                          exportConfig={typeof collection.exportable === "object" ? collection.exportable : undefined}
                          path={path}/>;

        const collectionEditButton = editable &&
            <IconButton
                component={ReactLink}
                to={navigationContext.buildUrlEditCollectionPath({ path })}>
                <Settings/>
            </IconButton>;

        const editButton = schemaEditable && <IconButton
            onClick={() => setSchemaDialogOpen(true)}>
            <Settings color="primary"/>
        </IconButton>;

        return (
            <>
                {extraActions}
                {multipleDeleteButton}
                {exportButton}
                {collectionEditButton}
                {editButton}
                {addButton}
            </>
        );
    }, [usedSelectionController, path, collection, largeLayout]);

    return (
        <>

            <CollectionTable
                key={`collection_table_${path}`}
                title={title}
                path={path}
                collection={collection}
                schemaResolver={schemaResolver}
                onSizeChanged={onSizeChanged}
                inlineEditing={checkInlineEditing}
                onEntityClick={onEntityClick}
                onColumnResize={onColumnResize}
                tableRowActionsBuilder={tableRowActionsBuilder}
                toolbarActionsBuilder={toolbarActionsBuilder}
                hoverRow={hoverRow}
            />

             <SchemaEditorDialog open={schemaDialogOpen}
                                 handleClose={(schema) => {
                                     setSchemaDialogOpen(false);
                                 }}
                                 schemaId={schema.id}/>

            {deleteEntityClicked &&
            <DeleteEntityDialog entityOrEntitiesToDelete={deleteEntityClicked}
                                path={path}
                                schemaResolver={schemaResolver}
                                callbacks={collection.callbacks}
                                open={!!deleteEntityClicked}
                                onEntityDelete={internalOnEntityDelete}
                                onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                                onClose={() => setDeleteEntityClicked(undefined)}/>}
        </>
    );
}

export default EntityCollectionView;
