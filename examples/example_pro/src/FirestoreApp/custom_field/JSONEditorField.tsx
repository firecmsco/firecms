import React from "react";
import { FieldHelperText, FieldProps, useModeController } from "@firecms/core";
import { ExpandablePanel } from "@firecms/ui";
import JsonView from "react18-json-view"
import "react18-json-view/src/style.css"

export function JSONEditorField({
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
    return (
        <>
            <ExpandablePanel initiallyExpanded={true}
                             title={property.name}
                             className={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}>
                <JsonView
                    src={value ?? customProps.defaultValue}
                    dark={mode === "dark"}
                    onEdit={(edit) => {
                        console.log("Edit");
                        console.log(edit.src);
                        setValue(edit.src);
                    }}
                    displaySize={"expanded"}
                    editable={true}
                />
            </ExpandablePanel>
            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>
        </>

    );

}
