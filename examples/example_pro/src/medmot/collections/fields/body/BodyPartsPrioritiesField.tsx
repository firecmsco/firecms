import React, { useState } from "react";
import { FieldProps } from "@firecms/core";
import { ManBack } from "./man_back";
import { ManFront } from "./man_front";
import "./bodyparts.css";
import { containerClasses, itemClasses } from "./utils";
import { FormControl } from "../FormControl";
import { Typography } from "@firecms/ui";


export default function BodyPartsPrioritiesField({

                                                     property,
                                                     value,
                                                     setValue,
                                                     error,
                                                     isSubmitting,
                                                     showError,
                                                 }: FieldProps<any>) {

    const [bodyPartsValue, setBodyPartsValue] = useState<Record<string, 1 | 2 | 3>>(value ?? {});

    const toggleBodyPart = (clickedBodyPart: string) => {

        let newBodyParts: Record<string, 1 | 2 | 3>;
        if (clickedBodyPart in bodyPartsValue) {
            const currentPartValue: 1 | 2 | 3 = bodyPartsValue[clickedBodyPart];

            if (currentPartValue === 3) {
                const { [clickedBodyPart]: ignore, ...rest } = bodyPartsValue;
                newBodyParts = rest;
            } else {
                newBodyParts = {
                    ...bodyPartsValue,
                    [clickedBodyPart]: currentPartValue + 1
                } as Record<string, 1 | 2 | 3>;
            }
        } else {
            newBodyParts = {
                ...bodyPartsValue,
                [clickedBodyPart]: 1
            };
            setBodyPartsValue(newBodyParts);
            setValue(newBodyParts);
        }

        console.log("newBodyParts", newBodyParts);
        setBodyPartsValue(newBodyParts);
        setValue(newBodyParts);
    };

    const partsArray: Record<string, "blue-dark" | "blue" | "blue-light"> =
        Object.entries(bodyPartsValue)
            .map(([key, value]) => {
                let color;
                if (value === 1) color = "blue-light";
                else if (value === 2) color = "blue";
                else if (value === 3) color = "blue-dark";
                return { [key]: color };
            })
            .reduce((a, b) => ({ ...a, ...b }), {}) as Record<string, "blue-dark" | "blue" | "blue-light">;

    return (

        <FormControl
            required={property.validation?.required}
            error={showError}
            disabled={isSubmitting}
            fullWidth>

            <Typography variant={"caption"} filled required={property.validation?.required}>
                {property.title}
            </Typography>

            <div className={containerClasses}>
                <div className={itemClasses}>
                    <ManFront toggleBodyPart={toggleBodyPart}
                              activeParts={partsArray}/>
                </div>
                <div className={itemClasses}>
                    <ManBack toggleBodyPart={toggleBodyPart}
                             activeParts={partsArray}/>
                </div>
            </div>

            {showError && <Typography variant={"caption"} color={"error"}
                id="component-error-text">{error}</Typography>}

            {property.description &&
            <Typography variant={"caption"}>{property.description}</Typography>}

        </FormControl>

    );

}


