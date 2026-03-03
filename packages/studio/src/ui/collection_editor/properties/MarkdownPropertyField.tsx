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
                                Paste behavior
                            </Typography>
                        </div>
                    }>

                    <div className={"flex flex-col gap-2 p-4"}>
                        <BooleanSwitchWithLabel
                            size={"small"}
                            disabled={disabled}
                            value={!htmlValue}
                            onValueChange={(value) => updateMarkdownConfig("html", !value)}
                            label={"Strip HTML on paste"}
                        />
                        <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                            Remove HTML tags and inline styles when pasting content from external sources
                        </Typography>

                        <BooleanSwitchWithLabel
                            size={"small"}
                            disabled={disabled}
                            value={transformPastedTextValue}
                            onValueChange={(value) => updateMarkdownConfig("transformPastedText", value)}
                            label={"Convert pasted text to markdown"}
                        />
                        <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                            Convert rich text (from Google Docs, Word, etc.) to clean markdown format
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
                                File upload config
                            </Typography>
                        </div>
                    }>

                    <div className={"grid grid-cols-12 gap-2 p-4"}>


                        <div className={"col-span-12"}>
                            <Field name={fileName}
                                as={DebouncedTextField}
                                label={"File name"}
                                size={"small"}
                                disabled={hasFilenameCallback || disabled}
                                value={hasFilenameCallback ? "-" : fileNameValue}
                            />
                        </div>
                        <div className={"col-span-12"}>
                            <Field name={storagePath}
                                as={DebouncedTextField}
                                label={"Storage path"}
                                disabled={hasStoragePathCallback || disabled}
                                size={"small"}
                                value={hasStoragePathCallback ? "-" : storagePathValue}
                            />
                            <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                                <p>You can use the following placeholders in
                                    the file name
                                    and storage path values:</p>
                                <ul>
                                    <li>{"{file} - Full name of the uploaded file"}</li>
                                    <li>{"{file.name} - Name of the uploaded file without extension"}</li>
                                    <li>{"{file.ext} - Extension of the uploaded file"}</li>
                                    <li>{"{entityId} - ID of the entity"}</li>
                                    <li>{"{propertyKey} - ID of this field"}</li>
                                    <li>{"{path} - Path of this entity"}</li>
                                    <li>{"{rand} - Random value used to avoid name collisions"}</li>
                                </ul>
                            </Typography>

                            <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                                When using Markdown, the URL of the uploaded files are always saved in the text value
                                (not
                                the path).
                            </Typography>
                        </div>

                        <div className={"col-span-12"}>
                            <DebouncedTextField name={maxSize}
                                type={"number"}
                                label={"Max size (in bytes)"}
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
                    label={"Default value"}
                    value={getIn(values, "defaultValue") ?? ""} />

            </div>
        </>
    );
}
