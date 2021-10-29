import React, { useState } from "react";
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
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntityCollection,
    SaveEntityProps
} from "../../models";
import CollectionTable from "../../collection/components/CollectionTable";

import CollectionRowActions
    from "../../collection/internal/CollectionRowActions";
import DeleteEntityDialog from "../../collection/internal/DeleteEntityDialog";
import ExportButton from "../../collection/internal/ExportButton";
import {
    getSubcollectionColumnId,
    useColumnIds
} from "../../collection/internal/common";

import { canCreate, canDelete, canEdit } from "../util/permissions";
import {
    OnCellValueChange,
    OnColumnResizeParams,
    UniqueFieldValidator
} from "../../collection";
import { Markdown } from "../../preview";
import {
    saveEntityWithCallbacks,
    useAuthController,
    useDataSource,
    useFireCMSContext,
    useSideEntityController
} from "../../hooks";
import { buildColumnsFromSchema } from "../../collection/components/util";

/**
 * @category Core components
 */
export interface EntityCollectionProps<M extends { [Key: string]: any }> {
    path: string;
    collection: EntityCollection<M>;
}

function getCollectionConfig(storageKey: string) {
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : {};
}

/**
 * This component is in charge of binding a datasource path with an {@link EntityCollection}
 * where it's configuration is defined. This is useful if you have defined already
 * your entity collections and need to build a custom component.
 *
 * Please note that you only need to use this component if you are building
 * a custom view. If you just need to create a default view you can do it
 * exclusively with config options.
 *
 * If you need a lower level implementation with more granular options, you
 * can try {@link CollectionTable}, which still does data fetching from the datasource.
 *
 * @param path
 * @param collectionConfig
 * @constructor
 * @category Core components
 */
export default function EntityCollectionTable<M extends { [Key: string]: any }>({
                                                                                    path,
                                                                                    collection
                                                                                }: EntityCollectionProps<M>
) {

    const sideEntityController = useSideEntityController();
    const dataSource = useDataSource();
    const context = useFireCMSContext();
    const authController = useAuthController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);
    const [selectedEntities, setSelectedEntities] = useState<Entity<M>[]>([]);

    const exportable = collection.exportable === undefined || collection.exportable;
    const inlineEditing = collection.inlineEditing === undefined || collection.inlineEditing;

    const selectionEnabled = collection.selectionEnabled === undefined || collection.selectionEnabled;
    const paginationEnabled = collection.pagination === undefined || Boolean(collection.pagination);
    const pageSize = typeof collection.pagination === "number" ? collection.pagination : undefined;

    const displayedProperties = useColumnIds(collection, true);

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const subcollectionColumns: AdditionalColumnDelegate<any>[] = collection.subcollections?.map((subcollection) => {
        return {
            id: getSubcollectionColumnId(subcollection),
            title: subcollection.name,
            width: 200,
            builder: ({ entity }) => (
                <Button color={"primary"}
                        onClick={(event) => {
                            event.stopPropagation();
                            sideEntityController.open({
                                path,
                                entityId: entity.id,
                                selectedSubpath: subcollection.path,
                                permissions: collection.permissions,
                                schema: collection.schema,
                                subcollections: collection.subcollections,
                                callbacks: collection.callbacks,
                                overrideSchemaResolver: false
                            });
                        }}>
                    {subcollection.name}
                </Button>
            )
        };
    }) ?? [];

    const additionalColumns = [...(collection.additionalColumns ?? []), ...subcollectionColumns];

    const onEntityClick = (entity: Entity<M>) => {
        sideEntityController.open({
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
        return path && sideEntityController.open({
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
        return inlineEditing;
    };

    const onCellChanged: OnCellValueChange<any, M> = ({
                                                          value,
                                                          name,
                                                          setSaved,
                                                          setError,
                                                          entity
                                                      }) => {
        const saveProps: SaveEntityProps<M> = {
            path,
            entityId: entity.id,
            values: {
                ...entity.values,
                [name]: value
            },
            schema: collection.schema,
            status: "existing"
        };

        return saveEntityWithCallbacks({
            ...saveProps,
            callbacks: collection.callbacks,
            dataSource,
            context,
            onSaveSuccess: () => setSaved(true),
            onSaveFailure: ((e: Error) => {
                setError(e);
            })
        });

    };

    const onColumnResize = ({ width, key, type }: OnColumnResizeParams) => {
        console.log("onColumnResize", width, key, type);
        const storageKey = `collection_config_${path}`;
        const collectionConfig = getCollectionConfig(storageKey);

        localStorage.setItem(storageKey, JSON.stringify({}));

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

    const toggleEntitySelection = (entity: Entity<M>) => {
        let newValue;
        if (selectedEntities.indexOf(entity) > -1) {
            newValue = selectedEntities.filter((item: Entity<M>) => item !== entity);
        } else {
            newValue = [...selectedEntities, entity];
        }
        setSelectedEntities(newValue);
        setDeleteEntityClicked(undefined);
    };


    const uniqueFieldValidator: UniqueFieldValidator = ({
                                                            name,
                                                            value,
                                                            property,
                                                            entityId
                                                        }) => dataSource.checkUniqueField(path, name, value, property, entityId);

    const tableRowActionsBuilder = ({
                                        entity,
                                        size
                                    }: { entity: Entity<any>, size: CollectionSize }) => {

        const isSelected = selectedEntities.indexOf(entity) > -1;

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

    function toolbarActionsBuilder({
                                       size,
                                       data
                                   }: { size: CollectionSize, data: Entity<any>[] }) {

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
            selectedEntities,
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

    const { cmsColumns, children } = buildColumnsFromSchema({
        schema: collection.schema,
        additionalColumns,
        displayedProperties,
        path,
        inlineEditing,
        size: "s", // todo
        onCellValueChange: onCellChanged,
        uniqueFieldValidator
    });

    return (
        <>

            <CollectionTable
                title={title}
                frozenIdColumn={largeLayout}
                path={path}
                columns={cmsColumns}
                schema={collection.schema}
                defaultSize={collection.defaultSize}
                initialFilter={collection.initialFilter}
                initialSort={collection.initialSort}
                textSearchEnabled={collection.textSearchEnabled}
                paginationEnabled={paginationEnabled}
                pageSize={pageSize}
                filterCombinations={collection.filterCombinations}
                inlineEditing={checkInlineEditing}
                onEntityClick={onEntityClick}
                onColumnResize={onColumnResize}
                tableRowActionsBuilder={tableRowActionsBuilder}
                toolbarActionsBuilder={toolbarActionsBuilder}
            />

            {children}

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

export { EntityCollectionTable };
