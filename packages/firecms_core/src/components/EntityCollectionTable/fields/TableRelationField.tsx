import React, { useCallback } from "react";
import equal from "react-fast-compare"

import { RelationPreview } from "../../../preview";
import { CollectionSize, Entity, EntityCollection, EntityRelation, FilterValues } from "@firecms/types";

import { getPreviewSizeFrom } from "../../../preview/util";
import { useCustomizationController, useNavigationController, useEntitySelectionTable } from "../../../hooks";
import { ErrorView } from "../../ErrorView";
import { cls, EditIcon } from "@firecms/ui";
import { EntityPreviewContainer } from "../../EntityPreview";
import { getRelationFrom } from "@firecms/common";

type TableRelationFieldProps = {
    name: string;
    disabled: boolean;
    internalValue: EntityRelation | EntityRelation[] | undefined | null;
    updateValue: (newValue: (EntityRelation | EntityRelation [] | null)) => void;
    size: CollectionSize;
    multiselect: boolean;
    previewProperties?: string[];
    title?: string;
    path: string;
    forceFilter?: FilterValues<string>;
    includeId?: boolean;
    includeEntityLink?: boolean;
};

export function TableRelationField(props: TableRelationFieldProps) {
    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();
    const { path } = props;
    const collection = navigationController.getCollection(path);
    if (!collection) {
        // if (customizationController.components?.missingRelation) {
        //     return <customizationController.components.missingRelation path={path}/>;
        // } else {
            throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
        // }
    }
    return <TableRelationFieldInternal {...props} collection={collection}/>;
}

export const TableRelationFieldInternal = React.memo(
    function TableRelationFieldInternal(props: TableRelationFieldProps & {
        collection: EntityCollection;
    }) {
        const {
            name,
            internalValue,
            updateValue,
            multiselect,
            path,
            size,
            previewProperties,
            title,
            disabled,
            forceFilter,
            collection,
            includeId,
            includeEntityLink
        } = props;

        const onSingleEntitySelected = useCallback((entity: Entity<any>) => {
            updateValue(entity ? getRelationFrom(entity) : null);
        }, [updateValue]);

        const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
            updateValue(entities.map((e) => getRelationFrom(e)));
        }, [updateValue]);

        const selectedEntityIds = internalValue
            ? (Array.isArray(internalValue)
                ? internalValue.map((ref) => ref.id)
                : internalValue.id ? [internalValue.id] : [])
            : [];

        const relationDialogController = useEntitySelectionTable({
                multiselect,
                path,
                collection,
                onMultipleEntitiesSelected,
                onSingleEntitySelected,
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

        const buildSingleRelationField = () => {
            if (internalValue && !Array.isArray(internalValue) && internalValue.isEntityRelation() && internalValue.isEntityRelation())
                return <RelationPreview
                    onClick={disabled ? undefined : handleOpen}
                    size={getPreviewSizeFrom(size)}
                    relation={internalValue as EntityRelation}
                    hover={!disabled}
                    disabled={!path}
                    previewProperties={previewProperties}
                    includeId={includeId}
                    includeEntityLink={includeEntityLink}
                />;
            else
                return <EntityPreviewContainer
                    onClick={disabled ? undefined : handleOpen}
                    size={getPreviewSizeFrom(size)}>
                    <ErrorView title="Value is not a relation." error={"Click to edit"}/>
                </EntityPreviewContainer>;
        };

        const buildMultipleRelationField = () => {
            if (Array.isArray(internalValue))
                return <>
                    {internalValue.map((relation, index) =>
                        <div className="w-full my-0.5"
                             key={`preview_array_ref_${name}_${index}`}>
                            <RelationPreview
                                onClick={disabled ? undefined : handleOpen}
                                size={"small"}
                                relation={relation}
                                hover={!disabled}
                                disabled={!path}
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

                {internalValue && !multiselect && buildSingleRelationField()}

                {internalValue && multiselect && buildMultipleRelationField()}

                {valueNotSet &&
                    <EntityPreviewContainer
                        className={cls("px-3 py-2 text-sm font-medium flex items-center",
                            multiselect ? "gap-4" : "gap-6",
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
