import React, { useCallback } from "react";
import equal from "react-fast-compare";

import { RelationPreview } from "../../../preview";
import { CollectionSize, Entity, EntityCollection, EntityRelation, FilterValues, Relation } from "@firecms/types";

import { getPreviewSizeFrom } from "../../../preview/util";
import { useEntitySelectionTable } from "../../../hooks";
import { ErrorView } from "../../ErrorView";
import { cls, Button, EditIcon, Typography, ExpandablePanel, fieldBackgroundMixin } from "@firecms/ui";
import { ArrayContainer, ArrayEntryParams } from "../../ArrayContainer";
import { getRelationFrom } from "@firecms/common";

type TableMultipleRelationFieldProps = {
    name: string;
    disabled: boolean;
    internalValue: EntityRelation[] | undefined | null;
    updateValue: (newValue: EntityRelation[] | null) => void;
    size: CollectionSize;
    previewProperties?: string[];
    title?: string;
    relation: Relation;
    forceFilter?: FilterValues<string>;
    includeId?: boolean;
    includeEntityLink?: boolean;
};

export function TableMultipleRelationField(props: TableMultipleRelationFieldProps) {
    const collection = props.relation.target();
    return <TableMultipleRelationFieldInternal {...props} collection={collection}/>;
}

export const TableMultipleRelationFieldInternal = React.memo(
    function TableMultipleRelationFieldInternal(props: TableMultipleRelationFieldProps & {
        collection: EntityCollection;
    }) {
        const {
            name,
            internalValue,
            updateValue,
            size,
            previewProperties,
            title,
            disabled,
            forceFilter,
            collection,
            includeId,
            includeEntityLink
        } = props;

        const value = Array.isArray(internalValue) ? internalValue : [];

        const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
            updateValue(entities.map(e => getRelationFrom(e)));
        }, [updateValue]);

        const selectedEntityIds = value.map((ref) => ref.id);

        const relationDialogController = useEntitySelectionTable({
                multiselect: true,
                path: collection.slug,
                collection,
                onMultipleEntitiesSelected,
                selectedEntityIds,
                forceFilter
            }
        );

        const handleOpen = () => {
            if (disabled)
                return;
            relationDialogController.open();
        };

        const buildEntry = useCallback(({
                                            index,
                                            internalId
                                        }: ArrayEntryParams) => {
            const entryValue = value && Array.isArray(value) && value.length > index ? value[index] : undefined;
            if (!entryValue)
                return <div>Internal ERROR</div>;
            return (
                <RelationPreview
                    key={internalId}
                    previewProperties={previewProperties}
                    size={getPreviewSizeFrom(size)}
                    onClick={handleOpen}
                    hover={!disabled}
                    relation={entryValue}
                    includeId={includeId}
                    includeEntityLink={includeEntityLink}
                />
            );
        }, [previewProperties, value, handleOpen, disabled, size, includeId, includeEntityLink]);

        const onValueChange = useCallback((newValue: EntityRelation[]) => {
            updateValue(newValue);
        }, [updateValue]);

        if (!collection)
            return <ErrorView error={"The specified collection does not exist"}/>;

        const titleContent = (
            <>
                <Typography variant="body2" className="font-medium text-text-secondary dark:text-text-secondary-dark">
                    {title}
                </Typography>
                {Array.isArray(value) && <Typography variant={"caption"} className={"px-2"}>({value.length})</Typography>}
            </>
        );

        const bodyContent = (
            <div className={"group"}>
                <ArrayContainer
                    droppableId={name}
                    value={value}
                    disabled={disabled}
                    buildEntry={buildEntry}
                    canAddElements={false}
                    addLabel={title ? "Add reference to " + title : "Add reference"}
                    newDefaultEntry={null as any}
                    onValueChange={onValueChange}
                />

                <Button
                    className="ml-2 my-2 justify-center text-left"
                    variant="text"
                    color="primary"
                    size="small"
                    disabled={disabled}
                    onClick={handleOpen}>
                    <EditIcon size={"small"}/>
                    Edit {title}
                </Button>
            </div>
        );

        return (
            <div className="w-full">
                <ExpandablePanel
                    titleClassName={cls("px-2 py-1", fieldBackgroundMixin)}
                    innerClassName={cls("px-2 pb-2 pt-1", fieldBackgroundMixin)}
                    title={titleContent}
                    initiallyExpanded={value.length > 0}>
                    {bodyContent}
                </ExpandablePanel>
            </div>
        );
    }, equal);
