import React, { useCallback, useMemo, useState } from "react";
import Tree, {
    moveItemOnTree,
    RenderItemParams,
    TreeData,
    TreeDestinationPosition,
    TreeSourcePosition
} from "../core/components/Tree";
import {
    TreeDraggableProvided
} from "../core/components/Tree/components/TreeItem/TreeItem-types";

import { getIn } from "formik";
import hash from "object-hash";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton
} from "@mui/material";

import { PropertiesOrBuilder, Property, PropertyOrBuilder } from "../models";
import {
    getFullId,
    idToPropertiesPath,
    propertiesToTree,
    treeToProperties
} from "./util";
import { sortProperties } from "../core/util/schemas";
import { removeUndefined } from "../core/util/objects";
import { CustomDialogActions } from "../core/components/CustomDialogActions";
import {
    PropertyBuilderPreview,
    PropertyFieldPreview
} from "./PropertyFieldPreview";

export function PropertyTree<M>({
                                    selectedPropertyId,
                                    setSelectedPropertyId,
                                    selectedPropertyNamespace,
                                    setSelectedPropertyNamespace,
                                    properties,
                                    propertiesOrder,
                                    errors,
                                    showErrors,
                                    onPropertyMove
                                }: {
    selectedPropertyId?: string;
    setSelectedPropertyId: (propertyId: string) => void;
    selectedPropertyNamespace?: string;
    setSelectedPropertyNamespace: (propertyNamespace?: string) => void;
    properties: PropertiesOrBuilder<M>;
    propertiesOrder: (keyof M)[];
    errors: Record<string, any>;
    showErrors: boolean;
    onPropertyMove: (properties: PropertiesOrBuilder<M>, propertiesOrder: (keyof M)[]) => void;
}) {

    const cleanedErrors = removeUndefined(errors);

    const selectedPropertyFullId = getFullId(selectedPropertyId, selectedPropertyNamespace)

    const [pendingMove, setPendingMove] = useState<[TreeSourcePosition, TreeDestinationPosition] | undefined>();

    const onPropertyClick = useCallback((property: PropertyOrBuilder, propertyId: string, namespace?: string) => {
        setSelectedPropertyId(propertyId);
        setSelectedPropertyNamespace(namespace);
    }, []);

    const renderItem = useCallback(({
                                        item,
                                        provided,
                                        snapshot
                                    }: RenderItemParams) => {
        const propertyFullKey = item.id as string;
        const propertyId = item.data.id as string;
        const propertyNamespace = item.data.namespace as string | undefined;
        const propertyOrBuilder = item.data.property as PropertyOrBuilder;
        const propertyPath = idToPropertiesPath(propertyFullKey);
        const hasError = showErrors && getIn(cleanedErrors, propertyPath);

        return (
            <SchemaEntry
                propertyKey={propertyId}
                propertyOrBuilder={propertyOrBuilder}
                provided={provided}
                hasError={hasError}
                onClick={() => onPropertyClick(propertyOrBuilder, propertyId, propertyNamespace)}
                selected={snapshot.isDragging || selectedPropertyFullId === item.id}
            />
        )
    }, [cleanedErrors, selectedPropertyFullId, onPropertyClick]);

    const tree = useMemo(() => {
        const sortedProperties = sortProperties(properties, propertiesOrder);
        return propertiesToTree(sortedProperties);
    }, [properties, propertiesOrder]);

    const doPropertyMove = useCallback((source: TreeSourcePosition, destination: TreeDestinationPosition) => {
        const newTree = moveItemOnTree(tree, source, destination);
        const [properties, propertiesOrder] = treeToProperties<M>(newTree);
        onPropertyMove(properties, propertiesOrder);
    }, [onPropertyMove, tree]);

    const onDragEnd = (
        source: TreeSourcePosition,
        destination?: TreeDestinationPosition
    ) => {

        if (!destination) {
            return;
        }

        if (!isValidDrag(tree, source, destination)) {
            return;
        }

        if (source.parentId !== destination.parentId) {
            setPendingMove([source, destination]);
        } else {
            doPropertyMove(source, destination);
        }

    };

    return (
        <>

            <Tree
                key={`tree_${selectedPropertyFullId}_${hash(errors)}`}
                tree={tree}
                offsetPerLevel={40}
                renderItem={renderItem}
                onDragEnd={onDragEnd}
                isDragEnabled
                isNestingEnabled={false}
            />

            <PendingMoveDialog open={Boolean(pendingMove)}
                               onAccept={() => {
                                   setPendingMove(undefined);
                                   if (pendingMove)
                                       doPropertyMove(pendingMove[0], pendingMove[1]);
                               }}
                               onCancel={() => setPendingMove(undefined)}/>

        </>
    );
}

function PendingMoveDialog({
                               open,
                               onAccept,
                               onCancel
                           }: { open: boolean, onAccept: () => void, onCancel: () => void }) {
    return <Dialog
        open={open}
        onClose={onCancel}
    >
        <DialogTitle>
            {"Are you sure?"}
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                You are moving one property from one context to
                another.
            </DialogContentText>
            <DialogContentText>
                This will <b>not transfer the data</b>, only modify
                the schema.
            </DialogContentText>
        </DialogContent>
        <CustomDialogActions>
            <Button
                onClick={onCancel}
                autoFocus>Cancel</Button>
            <Button
                variant="contained"
                onClick={onAccept}>
                Proceed
            </Button>
        </CustomDialogActions>
    </Dialog>;
}

export function SchemaEntry({
                                propertyKey,
                                propertyOrBuilder,
                                provided,
                                selected,
                                hasError,
                                onClick
                            }: {
    propertyKey: string;
    propertyOrBuilder: PropertyOrBuilder;
    provided: TreeDraggableProvided;
    selected: boolean;
    hasError: boolean;
    onClick: () => void;
}) {

    return (
        <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            sx={{
                position: "relative",
            }}
        >
            {typeof propertyOrBuilder === "object"
                ? <PropertyFieldPreview
                    property={propertyOrBuilder}
                    onClick={onClick}
                    includeTitle={true}
                    selected={selected}
                    hasError={hasError}/>
                : <PropertyBuilderPreview name={propertyKey}
                                          onClick={onClick}
                                          selected={selected}/>}

            <IconButton {...provided.dragHandleProps}
                        size="small"
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8
                        }}>
                <DragHandleIcon fontSize={"small"}/>
            </IconButton>
        </Box>
    );

}


function isValidDrag(tree: TreeData, source: TreeSourcePosition, destination: TreeDestinationPosition) {
    if (source.index === destination.index && source.parentId === destination.parentId)
        return false;
    const draggedPropertyId = tree.items[source.parentId].children[source.index];
    const draggedProperty = tree.items[draggedPropertyId].data.property;
    if (typeof draggedProperty === "function")
        return false;
    if (destination.parentId === tree.rootId)
        return true;
    const destinationPropertyId = tree.items[destination.parentId].id;
    const destinationProperty: Property = tree.items[destinationPropertyId].data.property;
    return typeof destinationProperty === "object" && destinationProperty.dataType === "map";
}
