import React from "react";

import { Entity, FieldProps } from "../../types";

import { PropertyPreview } from "../../preview";
import { FieldHelperText } from "../components";
import { ErrorBoundary, LabelWithIcon } from "../../components";
import { getIconForProperty } from "../../util";
import { cn, paperMixin } from "@firecms/ui";

/**
 *
 * Simply render the non-editable preview of a field
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
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

            {!tableMode && <LabelWithIcon icon={getIconForProperty(property, "small")}
                                          required={property.validation?.required}
                                          title={property.name}
                                          className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>
            }

            <div
                className={cn(paperMixin, "min-h-14 p-4 md:p-6 overflow-x-scroll no-scrollbar")}>

                <ErrorBoundary>
                    <PropertyPreview propertyKey={propertyKey}
                                     value={value}
                                     property={property}
                                     // entity={entity}
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
