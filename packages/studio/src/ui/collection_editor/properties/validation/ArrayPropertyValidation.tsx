import React from "react";

import { getIn, useFormex } from "@firecms/formex";
import { DebouncedTextField } from "@firecms/ui";
import { GeneralPropertyValidation } from "./GeneralPropertyValidation";

export function ArrayPropertyValidation({
                                            max = true,
                                            min = true,
                                            disabled
                                        }: {
    min?: boolean;
    max?: boolean;
    disabled: boolean;
}) {

    const {
        values,
        handleChange
    } = useFormex();

    const validationMin = "validation.min";
    const validationMax = "validation.max";

    return (
        <div className={"grid grid-cols-12 gap-2"}>

            <GeneralPropertyValidation disabled={disabled}/>

            {min && <div className={"col-span-6"}>
                <DebouncedTextField value={getIn(values, validationMin)}
                                    disabled={disabled}
                                    label={"Min length"}
                                    name={validationMin}
                                    type="number"
                                    size="small"
                                    onChange={handleChange}/>
            </div>}
            {max && <div className={"col-span-6"}>
                <DebouncedTextField value={getIn(values, validationMax)}
                                    disabled={disabled}
                                    label={"Max length"}
                                    name={validationMax}
                                    type="number"
                                    size="small"
                                    onChange={handleChange}/>
            </div>}
        </div>
    );
}
