import React from "react";
import { StringPropertyValidation } from "./validation/StringPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { getIn, useFormikContext } from "formik";

import { Select, SelectItem, TextField } from "@firecms/ui";

export function UrlPropertyField({
                                     disabled,
                                     showErrors
                                 }: {
    disabled: boolean;
    showErrors: boolean;
}) {

    const { values, setFieldValue } = useFormikContext();

    const urlValue = getIn(values, "url");

    return (
        <>
            <div className={"col-span-12"}>

                <Select
                    disabled={disabled}
                    position={"item-aligned"}
                    onValueChange={(value: string) => {
                        if (value === "[NONE]")
                            setFieldValue("url", true);
                        else
                            setFieldValue("url", value);
                    }}
                    label={"Preview type"}
                    renderValue={(value: string) => {
                        switch (value) {
                            case "image":
                                return "Image";
                            case "video":
                                return "Video";
                            case "audio":
                                return "Audio";
                            default:
                                return "Display URL";
                        }
                    }}
                    value={urlValue ?? "[NONE]"}>
                    <SelectItem value={"[NONE]"}>
                        Display URL
                    </SelectItem>
                    <SelectItem value={"image"}>
                        Image
                    </SelectItem>
                    <SelectItem value={"video"}>
                        Video
                    </SelectItem>
                    <SelectItem value={"audio"}>
                        Audio
                    </SelectItem>
                </Select>
            </div>

            <div className={"col-span-12"}>

                <ValidationPanel>

                    <StringPropertyValidation disabled={disabled}
                                              max={true}
                                              min={true}
                                              trim={true}
                                              showErrors={showErrors}/>

                </ValidationPanel>

            </div>

            <div className={"col-span-12"}>

                <TextField name={"defaultValue"}
                           disabled={disabled}
                           onChange={(e: any) => {
                               setFieldValue("defaultValue", e.target.value === "" ? undefined : e.target.value);
                           }}
                           label={"Default value"}
                           value={getIn(values, "defaultValue") ?? ""}/>

            </div>
        </>
    );
}
