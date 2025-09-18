import React, { useCallback, useMemo } from "react";

import { Entity, EntityCollection, EntityReference, FieldProps, Property, ReferenceProperty } from "@firecms/types";
import { useEntitySelectionDialog, useNavigationController } from "../../hooks";
import { ReadOnlyFieldBinding } from "./ReadOnlyFieldBinding";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { EntityPreviewContainer, ErrorView } from "../../components";
import { ReferencePreview } from "../../preview";
import { getIconForProperty, IconForView } from "../../util";
import { getReferenceFrom } from "@firecms/common";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { cls } from "@firecms/ui";

/**
 * Field that opens a reference selection dialog.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function ReferenceFieldBinding(props: FieldProps<ReferenceProperty>) {

    if (typeof props.property.path !== "string") {
        return <ReadOnlyFieldBinding {...props as FieldProps<Property>}/>
    }

    return <ReferenceFieldBindingInternal {...props}/>;

}

function ReferenceFieldBindingInternal({
                                           propertyKey,
                                           value,
                                           setValue,
                                           error,
                                           showError,
                                           isSubmitting,
                                           disabled,
                                           minimalistView,
                                           touched,
                                           autoFocus,
                                           property,
                                           includeDescription,
                                           size = "medium"
                                       }: FieldProps<ReferenceProperty>) {
    if (!property.path) {
        throw new Error("Property path is required for ReferenceFieldBinding");
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const validValue = value && value.isEntityReference && value.isEntityReference();

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

    const referenceDialogController = useEntitySelectionDialog({
            multiselect: false,
            path: property.path,
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

    return (
        <>
            {!minimalistView && <LabelWithIconAndTooltip
                propertyKey={propertyKey}
                icon={getIconForProperty(property, "small")}
                required={property.validation?.required}
                title={property.name ?? propertyKey}
                className={"h-8 text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>}

            {!collection && <ErrorView
                error={"The specified collection does not exist. Check console"}/>}

            {collection && <>

                {value && <ReferencePreview
                    disabled={!property.path}
                    previewProperties={property.previewProperties}
                    hover={!disabled}
                    size={size}
                    onClick={disabled || isSubmitting ? undefined : onEntryClick}
                    reference={value}
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
