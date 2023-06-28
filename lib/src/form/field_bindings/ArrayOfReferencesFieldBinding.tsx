import React, { useCallback, useMemo } from "react";
import { Entity, EntityCollection, EntityReference, FieldProps, ResolvedProperty } from "../../types";
import { ReferencePreview } from "../../preview";
import { FormikArrayContainer, LabelWithIcon } from "../components";
import { ErrorView, ExpandablePanel, getIconForProperty, getReferenceFrom } from "../../core";

import { useClearRestoreValue, useNavigationContext, useReferenceDialog } from "../../hooks";
import { Button } from "../../components/Button";
import { FieldHelperText } from "../components/FieldHelperText";

type ArrayOfReferencesFieldProps = FieldProps<EntityReference[]>;

/**
 * This field allows selecting multiple references.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayOfReferencesFieldBinding({
                                                  propertyKey,
                                                  value,
                                                  error,
                                                  showError,
                                                  isSubmitting,
                                                  tableMode,
                                                  property,
                                                  includeDescription,
                                                  setValue
                                              }: ArrayOfReferencesFieldProps) {

    const ofProperty = property.of as ResolvedProperty;
    if (ofProperty.dataType !== "reference") {
        throw Error("ArrayOfReferencesField expected a property containing references");
    }

    const expanded = property.expanded === undefined ? true : property.expanded;
    const [onHover, setOnHover] = React.useState(false);
    const selectedEntityIds = value && Array.isArray(value) ? value.map((ref) => ref.id) : [];

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const navigationContext = useNavigationContext();
    const collection: EntityCollection | undefined = useMemo(() => {
        return ofProperty.path ? navigationContext.getCollection(ofProperty.path) : undefined;
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

    const onEntryClick = useCallback(() => {
        referenceDialogController.open();
    }, [referenceDialogController]);

    const buildEntry = useCallback((index: number, internalId: number) => {
        const entryValue = value && value.length > index ? value[index] : undefined;
        if (!entryValue)
            return <div>Internal ERROR</div>;
        return (
            <div
                onMouseEnter={() => setOnHover(true)}
                onMouseMove={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}>
                <ReferencePreview
                    disabled={!ofProperty.path}
                    previewProperties={ofProperty.previewProperties}
                    size={"medium"}
                    onClick={onEntryClick}
                    reference={entryValue}
                    onHover={onHover}
                />
            </div>
        );
    }, [ofProperty.path, ofProperty.previewProperties, onHover, value]);

    const title = (
        <LabelWithIcon icon={getIconForProperty(property)}
                       required={property.validation?.required}
                       title={property.name}
                       className={"ml-3.5"}/>
    );

    const body = <>
        {!collection && <ErrorView
            error={"The specified collection does not exist. Check console"}/>}

        {collection && <>

            <FormikArrayContainer value={value}
                                  addLabel={property.name ? "Add reference to " + property.name : "Add reference"}
                                  name={propertyKey}
                                  buildEntry={buildEntry}
                                  disabled={isSubmitting}
                                  newDefaultEntry={property.of.defaultValue}/>

            <div className="p-4 justify-center text-left">
                <Button variant="outlined"
                        color="primary"
                        disabled={isSubmitting}
                        onClick={onEntryClick}>
                    Edit {property.name}
                </Button>
            </div>
        </>}
    </>;

    return (
        <>

            {!tableMode &&
                <ExpandablePanel initiallyExpanded={expanded} title={title}>
                    {body}
                </ExpandablePanel>}

            {tableMode && body}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>

        </>
    );
}
