import React, { useCallback, useMemo } from "react";
import { Entity, EntityCollection, EntityReference, FieldProps, Property, StringProperty } from "@firecms/types";
import { useEntitySelectionDialog, useNavigationController } from "../../hooks";
import { ReadOnlyFieldBinding } from "./ReadOnlyFieldBinding";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { ErrorView } from "../../components";
import { ReferencePreview } from "../../preview";
import { getIconForProperty, IconForView } from "../../util";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { EntityPreviewContainer } from "../../components/EntityPreview";
import { cls } from "@firecms/ui";

/**
 * Field that opens a reference selection dialog and stores the entity ID as a string.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function ReferenceAsStringFieldBinding(props: FieldProps<StringProperty>) {
    if (typeof props.property.reference?.path !== "string") {
        return <ReadOnlyFieldBinding {...props as FieldProps<Property>} />;
    }

    return <ReferenceAsStringFieldBindingInternal {...props} />;
}

function ReferenceAsStringFieldBindingInternal({
    propertyKey,
    value,
    setValue,
    error,
    showError,
    isSubmitting,
    disabled,
    minimalistView,
    property,
    includeDescription,
    size = "medium"
}: FieldProps<StringProperty>) {
    if (!property.reference?.path) {
        throw new Error("Property path is required for ReferenceAsStringFieldBinding");
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const navigationController = useNavigationController();
    const path = property.reference.path;
    const collection: EntityCollection | undefined = useMemo(() => {
        return path ? navigationController.getCollection(path) : undefined;
    }, [path]);

    const referenceValue: EntityReference | undefined = useMemo(() => {
        if (value && path) {
            return new EntityReference({ id: value, path });
        }
        return undefined;
    }, [value, path]);

    if (!collection) {
        throw Error(`Couldn't find the corresponding collection for the path: ${path}`);
    }

    const onSingleEntitySelected = useCallback((e: Entity<any> | null) => {
        setValue(e ? String(e.id) : null); // TODO: the string casting might be wrong
    }, [setValue]);

    const referenceDialogController = useEntitySelectionDialog({
        multiselect: false,
        path,
        collection,
        onSingleEntitySelected,
        selectedEntityIds: value ? [value] : undefined,
        forceFilter: property.reference.forceFilter
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
                className={"h-8 text-text-secondary dark:text-text-secondary-dark ml-3.5"} />}

            {!collection && <ErrorView
                error={"The specified collection does not exist. Check console"} />}

            {collection && <>

                {referenceValue && <ReferencePreview
                    disabled={!path}
                    previewProperties={property.reference?.previewProperties}
                    hover={!disabled}
                    size={size}
                    onClick={disabled || isSubmitting ? undefined : onEntryClick}
                    reference={referenceValue}
                    includeEntityLink={property.reference?.includeEntityLink}
                    includeId={property.reference?.includeId}
                />}

                {!value && <div className="justify-center text-left">
                    <EntityPreviewContainer
                        className={cls("px-6 h-16 text-sm font-medium flex items-center gap-6",
                            disabled || isSubmitting
                                ? "text-surface-accent-500"
                                : "cursor-pointer text-surface-accent-700 dark:text-surface-accent-300 hover:bg-surface-accent-50 dark:hover:bg-surface-800 group-hover:bg-surface-accent-50 dark:group-hover:bg-surface-800")}
                        onClick={onEntryClick}
                        size={"medium"}>
                        <IconForView collectionOrView={collection}
                            className={"text-surface-300 dark:text-surface-600"} />
                        {`Edit ${property.name}`.toUpperCase()}
                    </EntityPreviewContainer>
                </div>}
            </>}

            <FieldHelperText includeDescription={includeDescription}
                showError={showError}
                error={error}
                disabled={disabled}
                property={property} />

        </>
    );
}
