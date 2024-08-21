import React from "react";
import { StringPropertyValidation } from "./validation/StringPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { Field, getIn, useFormex } from "@firecms/formex";

import { DebouncedTextField, ExpandablePanel, FileUploadIcon, TextField, Typography } from "@firecms/ui";

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

    const metadata = `${baseStoragePath}.metadata`;
    const fileName = `${baseStoragePath}.fileName`;
    const maxSize = `${baseStoragePath}.maxSize`;
    const storagePath = `${baseStoragePath}.storagePath`;

    const fileNameValue = getIn(values, fileName) ?? "{rand}_{file}";
    const storagePathValue = getIn(values, storagePath) ?? "/";
    const maxSizeValue = getIn(values, maxSize);

    const hasFilenameCallback = typeof fileNameValue === "function";
    const hasStoragePathCallback = typeof storagePathValue === "function";

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
                                              showErrors={showErrors}/>

                </ValidationPanel>

            </div>

            <div className={"col-span-12"}>
                <ExpandablePanel
                    title={
                        <div className="flex flex-row text-gray-500">
                            <FileUploadIcon/>
                            <Typography variant={"subtitle2"}
                                        className="ml-2">
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
                           value={getIn(values, "defaultValue") ?? ""}/>

            </div>
        </>
    );
}
