import React, { useCallback } from "react";
import { StringPropertyValidation } from "./validation/StringPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { Field, getIn, useFormex } from "@firecms/formex";

import {
    BooleanSwitchWithLabel,
    CloudUploadIcon,
    DebouncedTextField,
    ExpandablePanel,
    SettingsIcon,
    TextField,
    Typography
} from "@firecms/ui";
import { useTranslation } from "@firecms/core";

export function MarkdownPropertyField({
    disabled,
    showErrors
}: {
    disabled: boolean;
    showErrors: boolean;
}) {

    const {
        values,
        setFieldValue
    } = useFormex();

    const { t } = useTranslation();

    const baseStoragePath = "storage";
    const baseMarkdownPath = "markdown";

    const metadata = `${baseStoragePath}.metadata`;
    const fileName = `${baseStoragePath}.fileName`;
    const maxSize = `${baseStoragePath}.maxSize`;
    const storagePath = `${baseStoragePath}.storagePath`;

    // Markdown config paths
    const htmlPath = `${baseMarkdownPath}.html`;
    const transformPastedTextPath = `${baseMarkdownPath}.transformPastedText`;

    const fileNameValue = getIn(values, fileName) ?? "{rand}_{file}";
    const storagePathValue = getIn(values, storagePath) ?? "/";
    const maxSizeValue = getIn(values, maxSize);

    // Markdown config values - check if markdown is an object or boolean
    const markdownValue = getIn(values, "markdown");
    const isMarkdownObject = typeof markdownValue === "object" && markdownValue !== null;
    const htmlValue = isMarkdownObject ? (markdownValue.html ?? true) : true;
    const transformPastedTextValue = isMarkdownObject ? (markdownValue.transformPastedText ?? false) : false;

    const hasFilenameCallback = typeof fileNameValue === "function";
    const hasStoragePathCallback = typeof storagePathValue === "function";

    // Handler to update markdown config - converts from boolean to object if needed
    const updateMarkdownConfig = useCallback((key: "html" | "transformPastedText", value: boolean) => {
        const currentMarkdown = getIn(values, "markdown");
        if (typeof currentMarkdown === "object" && currentMarkdown !== null) {
            // Already an object, update the key
            setFieldValue(`markdown.${key}`, value);
        } else {
            // Convert from boolean to object
            const defaultConfig = {
                html: true,
                transformPastedText: false
            };
            setFieldValue("markdown", {
                ...defaultConfig,
                [key]: value
            });
        }
    }, [values, setFieldValue]);

    return (
        <>
            <div className={"col-span-12"}>

                <ValidationPanel>

                    <StringPropertyValidation disabled={disabled}
                        length={true}
                        lowercase={true}
                        max={true}
                        min={true}
                        trim={true}
                        uppercase={true}
                        showErrors={showErrors} />

                </ValidationPanel>

            </div>

            <div className={"col-span-12"}>
                <ExpandablePanel
                    title={
                        <div className="flex flex-row text-surface-500">
                            <SettingsIcon />
                            <Typography variant={"subtitle2"}
                                className="ml-4">
                                {t("paste_behavior")}
                            </Typography>
                        </div>
                    }>

                    <div className={"flex flex-col gap-2 p-4"}>
                        <BooleanSwitchWithLabel
                            size={"small"}
                            disabled={disabled}
                            value={!htmlValue}
                            onValueChange={(value) => updateMarkdownConfig("html", !value)}
                            label={t("strip_html_on_paste")}
                        />
                        <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                            {t("strip_html_description")}
                        </Typography>

                        <BooleanSwitchWithLabel
                            size={"small"}
                            disabled={disabled}
                            value={transformPastedTextValue}
                            onValueChange={(value) => updateMarkdownConfig("transformPastedText", value)}
                            label={t("convert_pasted_to_markdown")}
                        />
                        <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                            {t("convert_pasted_description")}
                        </Typography>
                    </div>
                </ExpandablePanel>
            </div>

            <div className={"col-span-12"}>
                <ExpandablePanel
                    title={
                        <div className="flex flex-row text-surface-500">
                            <CloudUploadIcon />
                            <Typography variant={"subtitle2"}
                                className="ml-4">
                                {t("file_upload_config")}
                            </Typography>
                        </div>
                    }>

                    <div className={"grid grid-cols-12 gap-2 p-4"}>


                        <div className={"col-span-12"}>
                            <Field name={fileName}
                                as={DebouncedTextField}
                                label={t("file_name_label")}
                                size={"small"}
                                disabled={hasFilenameCallback || disabled}
                                value={hasFilenameCallback ? "-" : fileNameValue}
                            />
                        </div>
                        <div className={"col-span-12"}>
                            <Field name={storagePath}
                                as={DebouncedTextField}
                                label={t("storage_path_label")}
                                disabled={hasStoragePathCallback || disabled}
                                size={"small"}
                                value={hasStoragePathCallback ? "-" : storagePathValue}
                            />
                            <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                                <p>{t("storage_placeholders_description")}</p>
                                <ul>
                                    <li>{t("storage_placeholder_file")}</li>
                                    <li>{t("storage_placeholder_file_name")}</li>
                                    <li>{t("storage_placeholder_file_ext")}</li>
                                    <li>{t("storage_placeholder_entity_id")}</li>
                                    <li>{t("storage_placeholder_property_key")}</li>
                                    <li>{t("storage_placeholder_path")}</li>
                                    <li>{t("storage_placeholder_rand")}</li>
                                </ul>
                            </Typography>

                            <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                                {t("markdown_url_note")}
                            </Typography>
                        </div>

                        <div className={"col-span-12"}>
                            <DebouncedTextField name={maxSize}
                                type={"number"}
                                label={t("max_size_bytes")}
                                size={"small"}
                                value={maxSizeValue !== undefined && maxSizeValue !== null ? maxSizeValue.toString() : ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") setFieldValue(maxSize, undefined);
                                    else setFieldValue(maxSize, parseInt(value));
                                }}
                            />
                        </div>

                    </div>
                </ExpandablePanel>
            </div>

            <div className={"col-span-12"}>

                <TextField name={"defaultValue"}
                    disabled={disabled}
                    onChange={(e: any) => {
                        setFieldValue("defaultValue", e.target.value === "" ? undefined : e.target.value);
                    }}
                    label={t("default_value")}
                    value={getIn(values, "defaultValue") ?? ""} />

            </div>
        </>
    );
}
