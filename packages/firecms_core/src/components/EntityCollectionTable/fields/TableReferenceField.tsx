import React, { useCallback } from "react";
import equal from "react-fast-compare"

import { ReferencePreview } from "../../../preview";
import { CollectionSize, Entity, EntityCollection, EntityReference, FilterValues } from "../../../types";

import { getPreviewSizeFrom } from "../../../preview/util";
import { getReferenceFrom, IconForView } from "../../../util";
import { useCustomizationController, useNavigationController, useReferenceDialog } from "../../../hooks";
import { ErrorView } from "../../ErrorView";
import { cls, EditIcon } from "@firecms/ui";
import { EntityPreviewContainer } from "../../EntityPreview";

type TableReferenceFieldProps = {
    name: string;
    disabled: boolean;
    internalValue: EntityReference | EntityReference[] | undefined | null;
    updateValue: (newValue: (EntityReference | EntityReference [] | null)) => void;
    size: CollectionSize;
    multiselect: boolean;
    previewProperties?: string[];
    title?: string;
    path: string;
    forceFilter?: FilterValues<string>;
    includeId?: boolean;
    includeEntityLink?: boolean;
};

export function TableReferenceField(props: TableReferenceFieldProps) {
    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();
    const { path } = props;
    const collection = navigationController.getCollection(path);
    if (!collection) {
        if (customizationController.components?.missingReference) {
            return <customizationController.components.missingReference path={path}/>;
        } else {
            throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
        }
    }
    return <TableReferenceFieldInternal {...props} collection={collection}/>;
}

export const TableReferenceFieldInternal = React.memo(
    function TableReferenceFieldInternal(props: TableReferenceFieldProps & {
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
            updateValue(entity ? getReferenceFrom(entity) : null);
        }, [updateValue]);

        const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
            updateValue(entities.map((e) => getReferenceFrom(e)));
        }, [updateValue]);

        const selectedEntityIds = internalValue
            ? (Array.isArray(internalValue)
                ? internalValue.map((ref) => ref.id)
                : internalValue.id ? [internalValue.id] : [])
            : [];

        const referenceDialogController = useReferenceDialog({
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
            referenceDialogController.open();
        };

        const valueNotSet = !internalValue || (Array.isArray(internalValue) && internalValue.length === 0);

        const buildSingleReferenceField = () => {
            if (internalValue && !Array.isArray(internalValue) && internalValue.isEntityReference && internalValue.isEntityReference())
                return <ReferencePreview
                    onClick={disabled ? undefined : handleOpen}
                    size={getPreviewSizeFrom(size)}
                    reference={internalValue as EntityReference}
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
                    <ErrorView title="Value is not a reference." error={"Click to edit"}/>
                </EntityPreviewContainer>;
        };

        const buildMultipleReferenceField = () => {
            if (Array.isArray(internalValue))
                return <>
                    {internalValue.map((reference, index) =>
                        <div className="w-full my-0.5"
                             key={`preview_array_ref_${name}_${index}`}>
                            <ReferencePreview
                                onClick={disabled ? undefined : handleOpen}
                                size={"smallest"}
                                reference={reference}
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
                return <ErrorView error={"Data is not an array of references"}/>;
        };

        if (!collection)
            return <ErrorView error={"The specified collection does not exist"}/>;

        return (
            <div className="w-full group">

                {internalValue && !multiselect && buildSingleReferenceField()}

                {internalValue && multiselect && buildMultipleReferenceField()}

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
