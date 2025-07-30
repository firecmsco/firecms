import React, { useCallback, useMemo } from "react";
import { Entity, EntityCollection, EntityReference, FieldProps, ResolvedProperty } from "../../types";
import { ReferencePreview } from "../../preview";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { ArrayContainer, ArrayEntryParams, ErrorView } from "../../components";
import { getIconForProperty, getReferenceFrom } from "../../util";

import { useNavigationController, useReferenceDialog } from "../../hooks";
import { Button, cls, EditIcon, ExpandablePanel, fieldBackgroundMixin, Typography } from "@firecms/ui";
import { useClearRestoreValue } from "../useClearRestoreValue";

type ArrayOfReferencesFieldProps = FieldProps<EntityReference[]>;

/**
 * This field allows selecting multiple references.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function ArrayOfReferencesFieldBinding({
                                                  propertyKey,
                                                  value,
                                                  error,
                                                  showError,
                                                  disabled,
                                                  isSubmitting,
                                                  minimalistView: minimalistViewProp,
                                                  property,
                                                  includeDescription,
                                                  setValue,
                                                  setFieldValue
                                              }: ArrayOfReferencesFieldProps) {

    const minimalistView = minimalistViewProp || property.minimalistView;

    const ofProperty = property.of as ResolvedProperty;
    if (ofProperty.type !== "reference") {
        throw Error("ArrayOfReferencesField expected a property containing references");
    }

    const expanded = property.expanded === undefined ? true : property.expanded;
    const selectedEntityIds = value && Array.isArray(value) ? value.map((ref) => ref.id) : [];

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const navigationController = useNavigationController();
    const collection: EntityCollection | undefined = useMemo(() => {
        return ofProperty.path ? navigationController.getCollection(ofProperty.path) : undefined;
    }, [ofProperty.path]);

    if (!collection) {
        throw Error(`Couldn't find the corresponding collection for the path: ${ofProperty.path}`);
    }

    const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
        setValue(entities.map(e => getReferenceFrom(e)));
    }, [setValue]);

    const referenceDialogController = useReferenceDialog({
            multiselect: true,
            path: ofProperty.path,
            collection,
            onMultipleEntitiesSelected,
            selectedEntityIds,
            forceFilter: ofProperty.forceFilter
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
            <ReferencePreview
                key={internalId}
                disabled={!ofProperty.path}
                previewProperties={ofProperty.previewProperties}
                size={"medium"}
                onClick={onEntryClick}
                hover={!disabled}
                reference={entryValue}
                includeId={ofProperty.includeId}
                includeEntityLink={ofProperty.includeEntityLink}
            />
        );
    }, [ofProperty.path, ofProperty.previewProperties, value]);

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
                            newDefaultEntry={property.of.defaultValue}
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

            {!minimalistView &&
                <ExpandablePanel
                    titleClassName={fieldBackgroundMixin}
                    innerClassName={cls("px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2", fieldBackgroundMixin)}
                    initiallyExpanded={expanded}
                    title={title}>
                    {body}
                </ExpandablePanel>}

            {minimalistView && body}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
