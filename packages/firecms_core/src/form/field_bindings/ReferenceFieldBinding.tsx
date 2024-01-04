import React, { useCallback, useMemo } from "react";

import { Entity, EntityCollection, EntityReference, FieldProps } from "../../types";
import { useClearRestoreValue, useNavigationController, useReferenceDialog } from "../../hooks";
import { ReadOnlyFieldBinding } from "./ReadOnlyFieldBinding";
import { FieldHelperText } from "../components";
import { LabelWithIcon } from "../../components";
import { ReferencePreview } from "../../preview";
import { getIconForProperty, getReferenceFrom } from "../../util";
import { Button } from "@firecms/ui";
import { ErrorView } from "../../components";

/**
 * Field that opens a reference selection dialog.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function ReferenceFieldBinding<M extends Record<string, any>>(props: FieldProps<EntityReference>) {

    if (typeof props.property.path !== "string") {
        return <ReadOnlyFieldBinding {...props}/>
    }

    return <ReferenceFieldBindingInternal {...props}/>;

}

function ReferenceFieldBindingInternal<M extends Record<string, any>>({
                                                                          value,
                                                                          setValue,
                                                                          error,
                                                                          showError,
                                                                          isSubmitting,
                                                                          disabled,
                                                                          touched,
                                                                          autoFocus,
                                                                          property,
                                                                          includeDescription,
                                                                          context
                                                                      }: FieldProps<EntityReference>) {
    if (!property.path) {
        throw new Error("Property path is required for ReferenceFieldBinding");
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const validValue = value && value instanceof EntityReference;

    const navigationController = useNavigationController();
    const collection: EntityCollection | undefined = useMemo(() => {
        return property.path ? navigationController.getCollection(property.path) : undefined;
    }, [property.path]);

    if (!collection) {
        throw Error(`Couldn't find the corresponding collection for the path: ${property.path}`);
    }

    const onSingleEntitySelected = useCallback((e: Entity<any> | null) => {
        setValue(e ? getReferenceFrom(e) : null);
    }, [setValue]);

    const referenceDialogController = useReferenceDialog({
            multiselect: false,
            path: property.path,
            collection,
            onSingleEntitySelected,
            selectedEntityIds: validValue ? [value.id] : undefined,
            forceFilter: property.forceFilter
        }
    );

    const onEntryClick = useCallback((e: React.SyntheticEvent) => {
        e.preventDefault();
        referenceDialogController.open();
    }, [referenceDialogController]);

    return (
        <>
            <LabelWithIcon icon={getIconForProperty(property, "small")}
                           required={property.validation?.required}
                           title={property.name}
                           className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>

            {!collection && <ErrorView
                error={"The specified collection does not exist. Check console"}/>}

            {collection && <>

                {value && <ReferencePreview
                    disabled={!property.path}
                    previewProperties={property.previewProperties}
                    size={"medium"}
                    onClick={disabled || isSubmitting ? undefined : onEntryClick}
                    reference={value}
                />}

                {!value && <div className="justify-center text-left">
                    <Button variant="outlined"
                            color="primary"
                            disabled={disabled || isSubmitting}
                            onClick={onEntryClick}>
                        Edit {property.name}
                    </Button>
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
