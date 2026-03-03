import React from "react";
import { ValidationPanel } from "./validation/ValidationPanel";
import { GeneralPropertyValidation } from "./validation/GeneralPropertyValidation";

export function KeyValuePropertyField({ disabled }: {
    disabled: boolean;
}) {

    return (
        <>
            <div className={"col-span-12"}>

                <ValidationPanel>
                    <GeneralPropertyValidation disabled={disabled}/>
                </ValidationPanel>

            </div>
        </>
    );
}
