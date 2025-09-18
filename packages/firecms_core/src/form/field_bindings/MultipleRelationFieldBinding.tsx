import React, { useCallback } from "react";
import { Entity, FieldProps, RelationProperty } from "@firecms/types";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { ArrayContainer, ArrayEntryParams, ErrorView } from "../../components";
import { getIconForProperty } from "../../util";
import { getRelationFrom, resolveRelationProperty } from "@firecms/common";

import { useEntitySelectionDialog } from "../../hooks";
import { Button, cls, EditIcon, ExpandablePanel, fieldBackgroundMixin, Typography } from "@firecms/ui";
import { RelationPreview } from "../../preview";

/**
 * This field allows selecting multiple references.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function MultipleRelationFieldBinding({
                                                 propertyKey,
                                                 value: valueProp,
                                                 error,
                                                 showError,
                                                 disabled,
                                                 isSubmitting,
                                                 property,
                                                 includeDescription,
                                                 setValue,
                                                 setFieldValue,
                                                 context
                                             }: FieldProps<RelationProperty>) {

    const value = Array.isArray(valueProp) ? valueProp : [];

    if (property.type !== "relation") {
        throw Error("RelationFieldBinding expected a property containing a relation");
    }

    if (!context.collection?.relations) {
        throw Error("RelationFieldBinding expected a collection with relations");
    }
    const resolvedProperty = resolveRelationProperty(property, context.collection?.relations)
    const relation = resolvedProperty.relation;
    if (!relation)
        throw Error(
            "Property relation is required for MultipleRelationFieldBinding"
        )

    const selectedEntityIds = value && Array.isArray(value) ? value.map((ref) => ref.id) : [];
    const collection = relation.target();

    const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
        setValue(entities.map(e => getRelationFrom(e)));
    }, [setValue]);

    const referenceDialogController = useEntitySelectionDialog({
            multiselect: true,
            path: collection.slug,
            collection,
            onMultipleEntitiesSelected,
            selectedEntityIds,
            forceFilter: property.forceFilter
        }
    );

    const onEntryClick = (e: React.SyntheticEvent) => {
        e.preventDefault();
        referenceDialogController.open();
    };

    const buildEntry = useCallback(({
                                        index,
                                        internalId,
                                        storedProps,
                                        storeProps
                                    }: ArrayEntryParams) => {
        const entryValue = value && Array.isArray(value) && value.length > index ? value[index] : undefined;
        if (!entryValue)
            return <div>Internal ERROR</div>;
        return (
            <RelationPreview
                key={internalId}
                previewProperties={property.previewProperties}
                size={"medium"}
                onClick={onEntryClick}
                hover={!disabled}
                relation={entryValue}
                includeId={property.includeId}
                includeEntityLink={property.includeEntityLink}
            />
        );
    }, [relation, property.previewProperties, value]);

    const title = (<>
        <LabelWithIconAndTooltip
            propertyKey={propertyKey}
            icon={getIconForProperty(property, "small")}
            required={property.validation?.required}
            title={property.name ?? propertyKey}
            className={"h-8 flex grow text-text-secondary dark:text-text-secondary-dark"}/>
        {Array.isArray(value) && <Typography variant={"caption"} className={"px-4"}>({value.length})</Typography>}
    </>);

    const body = <>
        {!collection && <ErrorView
            error={"The specified collection does not exist. Check console"}/>}

        {collection && <div className={"group"}>

            <ArrayContainer droppableId={propertyKey}
                            value={value}
                            disabled={isSubmitting}
                            buildEntry={buildEntry}
                            canAddElements={false}
                            addLabel={property.name ? "Add reference to " + property.name : "Add reference"}
                            newDefaultEntry={null}
                            onValueChange={(value) => setFieldValue(propertyKey, value)}
            />

            <Button
                className="ml-3.5 my-4 justify-center text-left"
                variant="text"
                color="primary"
                disabled={isSubmitting}
                onClick={onEntryClick}>
                <EditIcon size={"small"}/>
                Edit {property.name}
            </Button>
        </div>}
    </>;

    return (
        <>

            <ExpandablePanel
                titleClassName={fieldBackgroundMixin}
                innerClassName={cls("px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2", fieldBackgroundMixin)}
                title={title}>
                {body}
            </ExpandablePanel>


            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
