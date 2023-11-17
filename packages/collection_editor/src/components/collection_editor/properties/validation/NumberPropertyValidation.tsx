import React from "react";

import { FastField, getIn, useFormikContext } from "formik";
import { DebouncedTextField, SwitchControl } from "@firecms/core";
import { GeneralPropertyValidation } from "./GeneralPropertyValidation";

export function NumberPropertyValidation({ disabled }: {
    disabled: boolean;
}) {

    const {
        values,
        handleChange
    } = useFormikContext();

    const validationMin = "validation.min";
    const validationMax = "validation.max";
    const validationLessThan = "validation.lessThan";
    const validationMoreThan = "validation.moreThan";
    const validationPositive = "validation.positive";
    const validationNegative = "validation.negative";
    const validationInteger = "validation.integer";

    return (

        <div className={"grid grid-cols-12 gap-2"}>
            <GeneralPropertyValidation disabled={disabled}/>


            <div className={"col-span-6"}>
                <DebouncedTextField value={getIn(values, validationMin)}
                                    label={"Min value"}
                                    name={validationMin}
                                    type="number"
                                    size="small"
                                    disabled={disabled}
                                    onChange={handleChange}/>
            </div>

            <div className={"col-span-6"}>
                <DebouncedTextField value={getIn(values, validationMax)}
                                    label={"Max value"}
                                    name={validationMax}
                                    type="number"
                                    size="small"

                                    disabled={disabled}
                                    onChange={handleChange}/>
            </div>


            <div className={"col-span-6"}>
                <DebouncedTextField
                    value={getIn(values, validationLessThan)}
                    label={"Less than"}
                    name={validationLessThan}
                    type="number"
                    size="small"

                    disabled={disabled}
                    onChange={handleChange}/>
            </div>

            <div className={"col-span-6"}>
                <DebouncedTextField
                    value={getIn(values, validationMoreThan)}
                    label={"More than"}
                    name={validationMoreThan}
                    type="number"
                    size="small"

                    disabled={disabled}
                    onChange={handleChange}/>
            </div>

            <div className={"col-span-4"}>
                <FastField type="checkbox"
                           name={validationPositive}
                           label={"Positive value"}
                           disabled={disabled}
                           component={SwitchControl}/>
            </div>
            <div className={"col-span-4"}>
                <FastField type="checkbox"
                           name={validationNegative}
                           label={"Negative value"}
                           disabled={disabled}
                           component={SwitchControl}/>
            </div>
            <div className={"col-span-4"}>
                <FastField type="checkbox"
                           name={validationInteger}
                           label={"Integer value"}
                           disabled={disabled}
                           component={SwitchControl}/>
            </div>
        </div>
    );
}
