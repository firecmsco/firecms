import React from "react";
import { FieldHelperText, FieldProps, removeUndefined, useModeController } from "@firecms/core";
import JsonView from "react18-json-view"
import "react18-json-view/src/style.css"
import { ExpandablePanel } from "@firecms/ui";

export function JSONField({
                                  property,
                                  value,
                                  setValue,
                                  setFieldValue,
                                  customProps,
                                  touched,
                                  includeDescription,
                                  showError,
                                  error,
                                  isSubmitting,
                                  context, // the rest of the entity values here
                                  ...props
                              }: FieldProps) {

    const { mode } = useModeController();
    const internalValue = removeUndefined({ ...value });
    return (
        <>
            <ExpandablePanel initiallyExpanded={true}
                             title={property.name ?? propertyKey}
                             innerClassName={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}>
                <span>{error}</span>
                <JsonView
                    src={internalValue}
                    dark={mode === "dark"}
                    onChange={(change) => {
                        const deleteValue = change.type === "delete" ? { [change.indexOrName]: undefined } : {};
                        setValue({ ...value, ...change.src, ...deleteValue });
                    }}
                    displaySize={"expanded"}
                    editable={customProps.editable}
                />
                <FieldHelperText includeDescription={includeDescription}
                                 showError={showError}
                                 error={error}
                                 property={property}/>
            </ExpandablePanel>

        </>

    );

}
