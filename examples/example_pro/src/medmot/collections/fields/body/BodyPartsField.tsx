import React, { useState } from "react";
import { FieldProps, LabelWithIcon } from "@firecms/core";
import { ManBack } from "./man_back";
import { ManFront } from "./man_front";
import "./bodyparts.css";
import { bodyPartsMap, bodyPartsMapReversed, bodyPartsMirroringMap } from "./body_parts";
import { containerClasses, itemClasses } from "./utils";
import { BooleanSwitchWithLabel, Typography } from "@firecms/ui";
import { FormControl } from "../FormControl";

interface BodyPartsFieldProps {
    mirroring: boolean;
    mapped: boolean;
    multiSelect: boolean;
}

export default function BodyPartsField({

                                           property,
                                           value,
                                           setValue,
                                           error,
                                           isSubmitting,
                                           showError,
                                           customProps,
                                           ...props
                                       }: FieldProps<any[] | any, BodyPartsFieldProps>) {

    if (!customProps) {
        throw Error("Missing customProps")
    }
    const {
        mirroring: mirroringProp,
        mapped,
        multiSelect
    } = customProps;

    const initialValue = value ?? (multiSelect ? [] : "");
    const [bodyPartsValue, setBodyPartsValue] = useState<string[] | string>(initialValue);
    const [mirroring, setMirroring] = useState<boolean>(mirroringProp ?? false);

    const toggleBodyPart = (clickedBodyPart: string) => {
        const value = mapped && !mirroring ? bodyPartsMap[clickedBodyPart] : clickedBodyPart;
        if (multiSelect) {
            if (bodyPartsValue.includes(value)) {
                const newBodyParts = (bodyPartsValue as string[]).filter((b) => {
                    if (!mirroring) {
                        return b !== value;
                    } else {
                        const mirroredParts = bodyPartsMirroringMap[value];
                        return !mirroredParts.includes(b);
                    }
                });
                setBodyPartsValue(newBodyParts);
                setValue(newBodyParts);
            } else {
                const newBodyParts = mirroring ?
                    [...bodyPartsMirroringMap[value], ...(bodyPartsValue as string[])] :
                    [value, ...(bodyPartsValue as string[])];
                console.log(newBodyParts);
                setBodyPartsValue(newBodyParts);
                setValue(newBodyParts);
            }
        } else {
            if (bodyPartsValue === value) {
                setBodyPartsValue("");
                setValue(null);
            } else {
                setBodyPartsValue(value);
                setValue(value);
            }
        }
    };

    let partsArray: string[] = multiSelect ?
        (mapped ?
            (bodyPartsValue as string[]).flatMap(p => bodyPartsMapReversed[p])
            : bodyPartsValue as string[])
        : (mapped ? bodyPartsMapReversed[bodyPartsValue as string] : [bodyPartsValue as string]);

    if (!partsArray)
        partsArray = [];

    return (

        <FormControl
            required={property.validation?.required}
            error={showError}
            disabled={isSubmitting}
            fullWidth>

            <LabelWithIcon title={property.name} icon={<></>}/>

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

            <BooleanSwitchWithLabel
                value={mirroring}
                onValueChange={setMirroring}
                className="self-center"
                disabled={mapped}
                label="Side mirroring"
            />

            {showError && <Typography variant="caption" color="error"
                                      id="component-error-text">{error}</Typography>}

            {property.description &&
                <Typography variant={"caption"}>{property.description}</Typography>}

        </FormControl>

    );

}


