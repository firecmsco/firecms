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
    IconButton,
    Paper,
    Typography
} from "@mui/material";
import {
    getIconForProperty,
    getWidgetNameForProperty
} from "../core/util/property_utils";

import { PropertiesOrBuilder, Property, PropertyOrBuilder } from "../models";
import {
    getFullId,
    idToPropertiesPath,
    propertiesToTree,
    treeToProperties
} from "./util";
import { sortProperties } from "../core/util/schemas";
import { getWidget } from "../core/util/widgets";
import { removeUndefined } from "../core/util/objects";
import { CustomDialogActions } from "../core/components/CustomDialogActions";

export function PropertyTree<M>({
                                    selectedPropertyId,
                                    setSelectedPropertyId,
                                    selectedPropertyNamespace,
                                    setSelectedPropertyNamespace,
                                    properties,
                                    propertiesOrder,
                                    errors,
                                    onPropertyMove,
                                }: {
    selectedPropertyId?: string;
    setSelectedPropertyId: (propertyId: string) => void;
    selectedPropertyNamespace?: string;
    setSelectedPropertyNamespace: (propertyNamespace?: string) => void;
    properties: PropertiesOrBuilder<M>;
    propertiesOrder: (keyof M)[];
    errors: Record<string, any>;
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
                                        onExpand,
                                        onCollapse,
                                        provided,
                                        snapshot
                                    }: RenderItemParams) => {
        const propertyFullKey = item.id as string;
        const propertyId = item.data.id as string;
        const propertyNamespace = item.data.namespace as string | undefined;
        const propertyOrBuilder = item.data.property as PropertyOrBuilder;
        const propertyPath = idToPropertiesPath(propertyFullKey);
        const hasError = getIn(cleanedErrors, propertyPath);

        return (
            <SchemaEntry
                propertyKey={propertyId}
                propertyOrBuilder={propertyOrBuilder}
                provided={provided}
                hasError={hasError}
                onClick={() => onPropertyClick(propertyOrBuilder, propertyId, propertyNamespace)}
                selected={snapshot.isDragging || selectedPropertyFullId === item.id}
                includeChildrenPlaceHolder={item.children.length > 0 && snapshot.isDragging}
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
                isNestingEnabled
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
                                includeChildrenPlaceHolder,
                                onClick
                            }: {
    propertyKey: string;
    propertyOrBuilder: PropertyOrBuilder;
    provided: TreeDraggableProvided;
    selected: boolean;
    hasError: boolean;
    includeChildrenPlaceHolder: boolean;
    onClick: () => void;
}) {

    const widget = typeof propertyOrBuilder !== "function" ? getWidget(propertyOrBuilder) : undefined;
    return (
        <Box
            onClick={onClick}
            ref={provided.innerRef}
            {...provided.draggableProps}

            // style={{
            //     ...provided.draggableProps.style
            // }}
            sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                pb: 1,
                cursor: "pointer"
            }}>
            <Box sx={{
                background: widget?.color ?? "#888",
                height: "32px",
                mt: 0.5,
                padding: 0.5,
                borderRadius: "50%",
                boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
                color: "white"
            }}>
                {getIconForProperty(propertyOrBuilder, "inherit", "medium")}
            </Box>
            <Box sx={{
                pl: 3,
                width: "100%",
                display: "flex",
                flexDirection: "row"
            }}>
                <Paper variant={"outlined"}
                       sx={(theme) => ({
                           position: "relative",
                           flexGrow: 1,
                           p: 2,
                           border: hasError
                               ? `1px solid ${theme.palette.error.light}`
                               : (selected ? `1px solid ${theme.palette.primary.light}` : undefined)
                       })}
                       elevation={0}>

                    {typeof propertyOrBuilder === "object"
                        ? <PropertyPreview property={propertyOrBuilder}/>
                        : <PropertyBuilderPreview name={propertyKey}/>}

                    <IconButton {...provided.dragHandleProps}
                                size="small"
                                sx={{
                                    position: "absolute",
                                        top: 8,
                                        right: 8
                                    }}>
                            <DragHandleIcon fontSize={"small"}/>
                        </IconButton>
                    </Paper>
                </Box>
            </Box>
    );

}

function PropertyPreview({
                             property
                         }: { property: Property }) {
    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>

            <Typography variant="subtitle1"
                        component="span"
                        sx={{ flexGrow: 1, pr: 2 }}>
                {property.title ? property.title : "\u00a0"}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Typography sx={{ flexGrow: 1, pr: 2 }}
                            variant="body2"
                            component="span"
                            color="text.secondary">
                    {getWidgetNameForProperty(property)}
                </Typography>
                <Typography variant="body2"
                            component="span"
                            color="text.disabled">
                    {property.dataType}
                </Typography>
            </Box>
        </Box>
    );
}

function PropertyBuilderPreview({
                                    name
                                }: { name: string }) {
    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <Typography variant="body2"
                        component="span"
                        color="text.disabled">
                {name}
            </Typography>
            <Typography sx={{ flexGrow: 1, pr: 2 }}
                        variant="body2"
                        component="span"
                        color="text.secondary">
                This property can only be edited in code
            </Typography>
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
