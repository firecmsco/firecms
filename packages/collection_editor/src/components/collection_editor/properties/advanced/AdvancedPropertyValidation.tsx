import React from "react";

import { FastField, useFormikContext } from "formik";
import { SwitchControl } from "@firecms/core";

export function AdvancedPropertyValidation({ disabled }: {disabled: boolean}) {

    const { values, handleChange } = useFormikContext();

    const columnWidth = "columnWidth";
    const hideFromCollection = "hideFromCollection";
    const readOnly = "readOnly";

    return (

        <div className={"grid grid-cols-12 gap-2"} >
            <div className={"col-span-12"}>
                <FastField type="checkbox"
                           name={hideFromCollection}
                           label={"Hide from collection"}
                           disabled={disabled}
                           tooltip={"Hide this field from the collection view. It will still be visible in the form view"}
                           component={SwitchControl}/>
            </div>

            <div className={"col-span-12"}>
                <FastField type="checkbox"
                           name={readOnly}
                           label={"Read only"}
                           disabled={disabled}
                           tooltip={"Is this a read only field. Display only as a preview"}
                           component={SwitchControl}/>
            </div>
        </div>
    );
}
