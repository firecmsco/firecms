import React, { useState } from "react";
import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntityCollection,
    EntitySchema,
    EntityStatus,
    saveEntity
} from "../models";
import CollectionTable from "./CollectionTable";
import {
    Box,
    Button,
    IconButton,
    Popover,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import { Add, Delete, InfoOutlined } from "@material-ui/icons";
import { CollectionRowActions } from "./CollectionRowActions";
import DeleteEntityDialog from "./DeleteEntityDialog";
import { getSubcollectionColumnId, useColumnIds } from "./common";
import {
    useAuthContext,
    useCMSAppContext,
    useSideEntityController
} from "../contexts";
import ExportButton from "./ExportButton";

import ReactMarkdown from "react-markdown";
import { canCreate, canDelete, canEdit } from "../util/permissions";
import {
    OnCellChangeParams,
    UniqueFieldValidator
} from "./CollectionTableProps";
import { checkUniqueField } from "../models/firestore";

type EntityCollectionProps<S extends EntitySchema<Key>, Key extends string> = {
    collectionPath: string;
    collectionConfig: EntityCollection<any>;
}

/**
 * This component is in charge of binding a Firestore path with an {@link EntityCollection}
 * where it's configuration is defined. This is useful if you have defined already
 * your entity collections and need to build a custom component.
 *
 * If you need a lower level implementation with more granular options, you
 * can try CollectionTable, which still does data fetching from Firestore.
 *
 * @param collectionPath
 * @param collectionConfig
 * @constructor
 */
export default function EntityCollectionTable<S extends EntitySchema<Key>, Key extends string>({
                                                                                                   collectionPath,
                                                                                                   collectionConfig
                                                                                               }: EntityCollectionProps<S, Key>
) {

    const sideEntityController = useSideEntityController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const context = useCMSAppContext();
    const authController = useAuthContext();

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<S, Key> | Entity<S, Key>[] | undefined>(undefined);
    const [selectedEntities, setSelectedEntities] = useState<Entity<S, Key>[]>([]);

    const exportable = collectionConfig.exportable === undefined || collectionConfig.exportable;
    const inlineEditing = collectionConfig.inlineEditing === undefined || collectionConfig.inlineEditing;

    const selectionEnabled = collectionConfig.selectionEnabled === undefined || collectionConfig.selectionEnabled;
    const paginationEnabled = collectionConfig.pagination === undefined || Boolean(collectionConfig.pagination);
    const pageSize = typeof collectionConfig.pagination === "number" ? collectionConfig.pagination : undefined;
    const displayedProperties = useColumnIds(collectionConfig, true);

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const subcollectionColumns: AdditionalColumnDelegate<any>[] = collectionConfig.subcollections?.map((subcollection) => {
        return {
            id: getSubcollectionColumnId(subcollection),
            title: subcollection.name,
            width: 200,
            builder: (entity: Entity<any>) => (
                <Button color={"primary"}
                        onClick={(event) => {
                            event.stopPropagation();
                            sideEntityController.open({
                                collectionPath: collectionPath,
                                entityId: entity.id,
                                selectedSubcollection: subcollection.relativePath,
                                permissions: subcollection.permissions,
                                schema: collectionConfig.schema,
                                subcollections: collectionConfig.subcollections,
                                overrideSchemaResolver: false
                            });
                        }}>
                    {subcollection.name}
                </Button>
            )
        };
    }) ?? [];

    const additionalColumns = [...collectionConfig.additionalColumns ?? [], ...subcollectionColumns];

    const onEntityClick = (entity: Entity<S, Key>) => {
        sideEntityController.open({
            entityId: entity.id,
            collectionPath,
            permissions: collectionConfig.permissions,
            schema: collectionConfig.schema,
            subcollections: collectionConfig.subcollections,
            overrideSchemaResolver: false
        });
    };

    const onNewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        return collectionPath && sideEntityController.open({
            collectionPath,
            permissions: collectionConfig.permissions,
            schema: collectionConfig.schema,
            subcollections: collectionConfig.subcollections,
            overrideSchemaResolver: false
        });
    };

    const internalOnEntityDelete = (collectionPath: string, entity: Entity<S, Key>) => {
        setSelectedEntities(selectedEntities.filter((e) => e.id !== entity.id));
    };

    const internalOnMultipleEntitiesDelete = (collectionPath: string, entities: Entity<S, Key>[]) => {
        setSelectedEntities([]);
    };

    const checkInlineEditing = (entity: Entity<any>) => {
        if (!canEdit(collectionConfig.permissions, authController.loggedUser, entity)) {
            return false;
        }
        return inlineEditing;
    };

    const onCellChanged = ({
                               value,
                               name,
                               setError,
                               entity
                           }: OnCellChangeParams<any, S, Key>) => saveEntity({
            collectionPath: collectionPath,
            id: entity.id,
            values: {
                ...entity.values,
                [name]: value
            },
            schema: collectionConfig.schema,
            status: EntityStatus.existing,
            onSaveFailure: ((e: Error) => {
                setError(e);
            }),
            context
        }
    );

    const title = (
        <>

            <Typography variant="h6">
                {`${collectionConfig.name}`}
            </Typography>
            <Typography variant={"caption"} color={"textSecondary"}>
                {`/${collectionPath}`}
            </Typography>

            {collectionConfig.description && <>
                <span style={{ paddingLeft: "8px" }}>
                <IconButton
                    size={"small"}
                    style={{
                        width: 16,
                        height: 16
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setAnchorEl(e.currentTarget);
                    }}>
                    <InfoOutlined fontSize={"small"}/>
                </IconButton>
                    </span>
                <Popover
                    id={"info-dialog"}
                    open={!!anchorEl}
                    anchorEl={anchorEl}
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
                        <ReactMarkdown>{collectionConfig.description}</ReactMarkdown>
                    </Box>
                </Popover>
            </>}

        </>
    );

    const toggleEntitySelection = (entity: Entity<S, Key>) => {
        let newValue;
        if (selectedEntities.indexOf(entity) > -1) {
            newValue = selectedEntities.filter((item: Entity<S, Key>) => item !== entity);
        } else {
            newValue = [...selectedEntities, entity];
        }
        setSelectedEntities(newValue);
    };


    const uniqueFieldValidator: UniqueFieldValidator = ({
                                                            name,
                                                            value,
                                                            property,
                                                            entityId
                                                        }) => checkUniqueField(collectionPath, name, value, property, entityId);

    const tableRowActionsBuilder = ({
                                        entity,
                                        size
                                    }: { entity: Entity<any>, size: CollectionSize }) => {

        const isSelected = selectedEntities.indexOf(entity) > -1;

        const createEnabled = canCreate(collectionConfig.permissions, authController.loggedUser);
        const editEnabled = canEdit(collectionConfig.permissions, authController.loggedUser, entity);
        const deleteEnabled = canDelete(collectionConfig.permissions, authController.loggedUser, entity);

        const onCopyClicked = (entity: Entity<S, Key>) => sideEntityController.open({
            entityId: entity.id,
            collectionPath,
            copy: true,
            permissions: {
                edit: editEnabled,
                create: createEnabled,
                delete: deleteEnabled
            },
            schema: collectionConfig.schema,
            subcollections: collectionConfig.subcollections,
            overrideSchemaResolver: false
        });

        const onEditClicked = (entity: Entity<S, Key>) => sideEntityController.open({
            entityId: entity.id,
            collectionPath,
            permissions: {
                edit: editEnabled,
                create: createEnabled,
                delete: deleteEnabled
            },
            schema: collectionConfig.schema,
            subcollections: collectionConfig.subcollections,
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
                onCopyClicked={editEnabled ? onCopyClicked : undefined}
                onDeleteClicked={deleteEnabled ? setDeleteEntityClicked : undefined}
            />
        );

    };

    function toolbarActionsBuilder({
                                       size,
                                       data
                                   }: { size: CollectionSize, data: Entity<any>[] }) {

        const addButton = canCreate(collectionConfig.permissions, authController.loggedUser) && onNewClick && (largeLayout ?
            <Button
                onClick={onNewClick}
                startIcon={<Add/>}
                size="large"
                variant="contained"
                color="primary">
                Add {collectionConfig.schema.name}
            </Button>
            : <Button
                onClick={onNewClick}
                size="medium"
                variant="contained"
                color="primary"
            >
                <Add/>
            </Button>);

        const multipleDeleteEnabled = selectedEntities.every((entity) => canDelete(collectionConfig.permissions, authController.loggedUser, entity));
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
                        onClick={onMultipleDeleteClick}>
                        <Delete/>
                    </IconButton>}
                </span>
            </Tooltip>;

        const extraActions = collectionConfig.extraActions ? collectionConfig.extraActions({
            view: collectionConfig,
            selectedEntities
        }) : undefined;

        const exportButton = exportable &&
            <ExportButton schema={collectionConfig.schema}
                          exportConfig={typeof collectionConfig.exportable === "object" ? collectionConfig.exportable : undefined}
                          collectionPath={collectionPath}/>;

        return (
            <>
                {extraActions}
                {multipleDeleteButton}
                {exportButton}
                {addButton}
            </>
        );
    }

    return (<>

            <CollectionTable
                title={title}
                frozenIdColumn={largeLayout}
                collectionPath={collectionPath}
                schema={collectionConfig.schema}
                additionalColumns={additionalColumns}
                defaultSize={collectionConfig.defaultSize}
                displayedProperties={displayedProperties}
                filterableProperties={collectionConfig.filterableProperties}
                initialFilter={collectionConfig.initialFilter}
                initialSort={collectionConfig.initialSort}
                textSearchDelegate={collectionConfig.textSearchDelegate}
                paginationEnabled={paginationEnabled}
                pageSize={pageSize}
                inlineEditing={checkInlineEditing}
                uniqueFieldValidator={uniqueFieldValidator}
                onEntityClick={onEntityClick}
                onCellValueChange={onCellChanged}
                tableRowActionsBuilder={tableRowActionsBuilder}
                toolbarActionsBuilder={toolbarActionsBuilder}
            />

            <DeleteEntityDialog entityOrEntitiesToDelete={deleteEntityClicked}
                                collectionPath={collectionPath}
                                schema={collectionConfig.schema}
                                open={!!deleteEntityClicked}
                                onEntityDelete={internalOnEntityDelete}
                                onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                                onClose={() => setDeleteEntityClicked(undefined)}/>
        </>
    );
}

export { EntityCollectionTable };
