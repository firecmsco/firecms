import React, { useCallback } from "react";
import { Entity, FieldProps, RelationProperty } from "@firecms/types";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { EntityPreviewContainer, ErrorView } from "../../components";
import { getIconForProperty, IconForView } from "../../util";
import { getRelationFrom, resolveRelationProperty } from "@firecms/common";

import { useEntitySelectionDialog } from "../../hooks";
import { cls } from "@firecms/ui";
import { RelationPreview } from "../../preview";
import { RelationSelector } from "../../components/RelationSelector";
import { MultipleRelationFieldBinding } from "./MultipleRelationFieldBinding";

export function RelationFieldBinding({
                                         propertyKey,
                                         value,
                                         size,
                                         error,
                                         showError,
                                         disabled,
                                         isSubmitting,
                                         property,
                                         includeDescription,
                                         setValue,
                                         setFieldValue,
                                         context,
                                         customProps
                                     }: FieldProps<RelationProperty>) {

    if (property.type !== "relation") {
        throw Error("RelationFieldBinding expected a property containing a relation");
    }
    if (!context.collection?.relations) {
        throw Error("RelationFieldBinding expected a collection with relations");
    }
    const resolvedProperty = resolveRelationProperty(property, context.collection?.relations)
    const relation = resolvedProperty.relation;

    const manyRelation = relation?.cardinality === "many";

    // Inline selector mode
    const widget = property.widget ?? "select";

    if (widget === "select" && relation) {
        const singleValue = (!manyRelation && value && !Array.isArray(value) && value.isEntityRelation && value.isEntityRelation()) ? value : null;
        const multipleValue = (manyRelation && Array.isArray(value)) ? value : [];

        const selectorSize: "small" | "medium" | undefined = size === "large" ? "medium" : size;

        return (
            <div className="">
                <LabelWithIconAndTooltip
                    propertyKey={propertyKey}
                    icon={getIconForProperty(property, "small")}
                    required={property.validation?.required}
                    title={property.name ?? propertyKey}
                    className={"h-8 text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>

                <RelationSelector
                    relation={relation}
                    value={manyRelation ? multipleValue : singleValue}
                    onValueChange={(newVal) => {
                        if (manyRelation) {
                            setValue(Array.isArray(newVal) ? newVal : []);
                        } else {
                            setValue(!Array.isArray(newVal) ? (newVal ?? null) : null);
                        }
                    }}
                    disabled={disabled || isSubmitting}
                    forceFilter={property.forceFilter}
                    size={selectorSize}
                />

                <FieldHelperText includeDescription={includeDescription}
                                 showError={showError}
                                 error={error}
                                 disabled={disabled}
                                 property={property}/>
            </div>
        );
    }

    if (manyRelation) {
        return <MultipleRelationFieldBinding
            propertyKey={propertyKey}
            value={Array.isArray(value) ? value : []}
            error={error}
            showError={showError}
            disabled={disabled}
            isSubmitting={isSubmitting}
            property={property}
            includeDescription={includeDescription}
            setValue={setValue}
            setFieldValue={setFieldValue}
            context={context}
            customProps={customProps}
        />
    } else {

        const validValue = value && !Array.isArray(value) && value.isEntityRelation && value.isEntityRelation();

        const collection = relation?.target();

        if (!collection) {
            throw Error(`Couldn't find the corresponding collection for the relation: ${propertyKey}`);
        }

        const onSingleEntitySelected = useCallback((e: Entity<any> | null) => {
            setValue(e ? getRelationFrom(e) : null);
        }, [setValue]);

        const referenceDialogController = useEntitySelectionDialog({
                multiselect: false,
                path: collection.slug,
                collection,
                onSingleEntitySelected,
                selectedEntityIds: validValue ? [value.id] : undefined,
                forceFilter: property.forceFilter
            }
        );

        const onEntryClick = (e: React.SyntheticEvent) => {
            e.preventDefault();
            referenceDialogController.open();
        };

        const usedRelation = Array.isArray(value) ? undefined : value;
        return (
            <>
                <LabelWithIconAndTooltip
                    propertyKey={propertyKey}
                    icon={getIconForProperty(property, "small")}
                    required={property.validation?.required}
                    title={property.name ?? propertyKey}
                    className={"h-8 text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>

                {!collection && <ErrorView
                    error={"The specified collection does not exist. Check console"}/>}

                {collection && <>

                    {usedRelation && <RelationPreview
                        disabled={!usedRelation}
                        previewProperties={property.previewProperties}
                        hover={!disabled}
                        size={size}
                        onClick={disabled || isSubmitting ? undefined : onEntryClick}
                        relation={usedRelation}
                        includeEntityLink={property.includeEntityLink}
                        includeId={property.includeId}
                    />}

                    {!value && <div className="justify-center text-left">
                        <EntityPreviewContainer className={cls("px-6 h-16 text-sm font-medium flex items-center gap-6",
                            disabled || isSubmitting
                                ? "text-surface-accent-500"
                                : "cursor-pointer text-surface-accent-700 dark:text-surface-accent-300 hover:bg-surface-accent-50 dark:hover:bg-surface-800 group-hover:bg-surface-accent-50 dark:group-hover:bg-surface-800")}
                                                onClick={onEntryClick}
                                                size={"medium"}>
                            <IconForView collectionOrView={collection}
                                         className={"text-surface-300 dark:text-surface-600"}/>
                            {`Edit ${property.name}`.toUpperCase()}
                        </EntityPreviewContainer>
                    </div>}
                </>}

                <FieldHelperText includeDescription={includeDescription}
                                 showError={showError}
                                 error={error}
                                 disabled={disabled}
                                 property={property}/>

            </>
        );
    }
}
