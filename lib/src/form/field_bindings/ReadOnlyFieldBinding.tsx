import React from "react";
import clsx from "clsx";

import { FormHelperText } from "@mui/material";

import { Entity, FieldProps } from "../../types";

import { PropertyPreview } from "../../preview";
import { LabelWithIcon } from "../components";
import { ErrorBoundary } from "../../core/components/ErrorBoundary";
import { getIconForProperty } from "../../core";
import { paperMixin } from "../../styles";
import { FieldHelperText } from "../components/FieldHelperText";

/**
 *
 * Simply render the non-editable preview of a field
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ReadOnlyFieldBinding({
                                         propertyKey,
                                         value,
                                         error,
                                         showError,
                                         tableMode,
                                         property,
                                         includeDescription,
                                         context
                                     }: FieldProps<any>) {

    if (!context.entityId)
        throw new Error("ReadOnlyFieldBinding: Entity id is null");

    const entity: Entity<any> = {
        id: context.entityId!,
        values: context.values,
        path: context.path
    };

    return (

        <>

            {!tableMode && <FormHelperText filled>
                <LabelWithIcon icon={getIconForProperty(property)}
                               required={property.validation?.required}
                               title={property.name}
                               className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>
            </FormHelperText>}

            <div
                className={clsx(paperMixin, "min-h-14 p-4 md:p-6")}>

                <ErrorBoundary>
                    <PropertyPreview propertyKey={propertyKey}
                                     value={value}
                                     property={property}
                                     entity={entity}
                                     size={"medium"}/>
                </ErrorBoundary>

            </div>


            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>

        </>
    );
}
