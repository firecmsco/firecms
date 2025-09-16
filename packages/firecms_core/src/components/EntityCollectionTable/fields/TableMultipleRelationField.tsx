import React, { useCallback } from "react";
import equal from "react-fast-compare";

import { RelationPreview } from "../../../preview";
import { CollectionSize, Entity, EntityCollection, EntityRelation, FilterValues, Relation } from "@firecms/types";

import { useEntitySelectionTable } from "../../../hooks";
import { ErrorView } from "../../ErrorView";
import { cls, EditIcon } from "@firecms/ui";
import { EntityPreviewContainer } from "../../EntityPreview";
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

        const valueNotSet = !internalValue || (Array.isArray(internalValue) && internalValue.length === 0);

        const buildMultipleRelationField = () => {
            if (Array.isArray(internalValue))
                return <>
                    {internalValue.map((relationItem, index) =>
                        <div className="w-full my-0.5"
                             key={`preview_array_ref_${name}_${index}`}>
                            <RelationPreview
                                onClick={disabled ? undefined : handleOpen}
                                size={"small"}
                                relation={relationItem}
                                hover={!disabled}
                                previewProperties={previewProperties}
                                includeId={includeId}
                                includeEntityLink={includeEntityLink}
                            />
                        </div>
                    )
                    }
                </>;
            else
                return <ErrorView error={"Data is not an array of relations"}/>;
        };

        if (!collection)
            return <ErrorView error={"The specified collection does not exist"}/>;

        return (
            <div className="w-full group">

                {internalValue && buildMultipleRelationField()}

                {valueNotSet &&
                    <EntityPreviewContainer
                        className={cls("px-3 py-2 text-sm font-medium flex items-center gap-4",
                            disabled
                                ? "text-surface-accent-500"
                                : "cursor-pointer text-text-secondary dark:text-text-secondary-dark hover:bg-surface-accent-50 dark:hover:bg-surface-800 group-hover:bg-surface-accent-50 dark:group-hover:bg-surface-800")}
                        onClick={handleOpen}
                        size={"medium"}>
                        <EditIcon
                            size={"small"}
                            className={"ml-2 mr-1 text-surface-300 dark:text-surface-600"}/>
                        {title}
                    </EntityPreviewContainer>}

            </div>
        );
    }, equal);
