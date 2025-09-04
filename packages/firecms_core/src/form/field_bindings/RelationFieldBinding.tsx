import React, { useCallback, useMemo } from "react";
import { Entity, EntityCollection, EntityRelation, FieldProps } from "@firecms/types";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { ArrayContainer, ArrayEntryParams, EntityPreviewContainer, ErrorView } from "../../components";
import { getIconForProperty, IconForView } from "../../util";
import { getRelationFrom } from "@firecms/common";

import { useEntitySelectionTable, useNavigationController } from "../../hooks";
import { Button, cls, EditIcon, ExpandablePanel, fieldBackgroundMixin, Typography } from "@firecms/ui";
import { RelationPreview } from "../../preview";

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
                                     }: FieldProps<EntityRelation | EntityRelation[]>) {

    if (property.type !== "relation") {
        throw Error("RelationFieldBinding expected a property containing a relation");
    }

    const manyRelation = property.relation?.type === "many" || property.relation?.type === "manyToMany";
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

        const collection = property.relation.target();

        if (!collection) {
            throw Error(`Couldn't find the corresponding collection for the relation: ${propertyKey}`);
        }

        const onSingleEntitySelected = useCallback((e: Entity<any> | null) => {
            setValue(e ? getRelationFrom(e) : null);
        }, [setValue]);

        const referenceDialogController = useEntitySelectionTable({
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

        const relation = Array.isArray(value) ? undefined : value;
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

                    {relation && <RelationPreview
                        disabled={!property.relation}
                        previewProperties={property.previewProperties}
                        hover={!disabled}
                        size={size}
                        onClick={disabled || isSubmitting ? undefined : onEntryClick}
                        relation={relation}
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

/**
 * This field allows selecting multiple references.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function MultipleRelationFieldBinding({
                                                 propertyKey,
                                                 value,
                                                 error,
                                                 showError,
                                                 disabled,
                                                 isSubmitting,
                                                 property,
                                                 includeDescription,
                                                 setValue,
                                                 setFieldValue
                                             }: FieldProps<EntityRelation[]>) {

    console.log("MultipleRelationFieldBinding render", {propertyKey, value});

    if (property.type !== "relation") {
        throw Error("RelationFieldBinding expected a property containing a relation");
    }

    const selectedEntityIds = value && Array.isArray(value) ? value.map((ref) => ref.id) : [];
    const collection = property.relation.target();

    const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
        setValue(entities.map(e => getRelationFrom(e)));
    }, [setValue]);

    const referenceDialogController = useEntitySelectionTable({
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
        const entryValue = value && value.length > index ? value[index] : undefined;
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
    }, [property.relation, property.previewProperties, value]);

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
