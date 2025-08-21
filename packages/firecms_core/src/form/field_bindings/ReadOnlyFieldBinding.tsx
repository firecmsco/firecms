import React from "react";

import { FieldProps } from "@firecms/types";

import { PropertyPreview } from "../../preview";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { ErrorBoundary } from "../../components";
import { getIconForProperty } from "../../util";
import { cls, paperMixin } from "@firecms/ui";

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
                                         minimalistView,
                                         property,
                                         includeDescription,
                                         context
                                     }: FieldProps<any>) {

    if (!context.entityId)
        throw new Error("ReadOnlyFieldBinding: Entity id is null");

    return (

        <>

            {!minimalistView && <LabelWithIconAndTooltip
                propertyKey={propertyKey}
                icon={getIconForProperty(property, "small")}
                required={property.validation?.required}
                title={property.name ?? propertyKey}
                className={"h-8 text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>
            }

            <div
                className={cls(paperMixin, "w-full min-h-14 p-4 md:p-6 overflow-x-scroll no-scrollbar")}>

                <ErrorBoundary>
                    <PropertyPreview propertyKey={propertyKey}
                                     value={value}
                                     property={property}
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
