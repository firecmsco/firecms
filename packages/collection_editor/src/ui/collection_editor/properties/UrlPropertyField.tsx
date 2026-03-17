import React from "react";
import { StringPropertyValidation } from "./validation/StringPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { getIn, useFormex } from "@firecms/formex";

import { Select, SelectItem, TextField } from "@firecms/ui";
import { useTranslation } from "@firecms/core";

export function UrlPropertyField({
                                     disabled,
                                     showErrors
                                 }: {
    disabled: boolean;
    showErrors: boolean;
}) {

    const { values, setFieldValue } = useFormex();
    const { t } = useTranslation();

    const urlValue = getIn(values, "url");

    return (
        <>
            <div className={"col-span-12"}>

                <Select
                    disabled={disabled}
                    position={"item-aligned"}
                    fullWidth={true}
                    onValueChange={(value: string) => {
                        if (value === "[NONE]")
                            setFieldValue("url", true);
                        else
                            setFieldValue("url", value);
                    }}
                    label={t("preview_type")}
                    renderValue={(value: string) => {
                        switch (value) {
                            case "image":
                                return t("preview_image");
                            case "video":
                                return t("preview_video");
                            case "audio":
                                return t("preview_audio");
                            default:
                                return t("display_url");
                        }
                    }}
                    value={urlValue ?? "[NONE]"}>
                    <SelectItem value={"[NONE]"}>
                        {t("display_url")}
                    </SelectItem>
                    <SelectItem value={"image"}>
                        {t("preview_image")}
                    </SelectItem>
                    <SelectItem value={"video"}>
                        {t("preview_video")}
                    </SelectItem>
                    <SelectItem value={"audio"}>
                        {t("preview_audio")}
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
                           label={t("default_value")}
                           value={getIn(values, "defaultValue") ?? ""}/>

            </div>
        </>
    );
}
