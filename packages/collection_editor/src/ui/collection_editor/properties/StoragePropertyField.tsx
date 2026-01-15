import React from "react";
import {
    Button,
    CloudUploadIcon,
    DebouncedTextField,
    ExpandablePanel,
    MultiSelect,
    MultiSelectItem,
    Select,
    SelectItem,
    Typography
} from "@firecms/ui";

import { Field, FormexFieldProps, getIn, useFormex } from "@firecms/formex";
import { GeneralPropertyValidation } from "./validation/GeneralPropertyValidation";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { SwitchControl } from "../SwitchControl";

const fileTypes: Record<string, string> = {
    "image/*": "Images",
    "video/*": "Videos",
    "audio/*": "Audio files",
    "application/*": "Files (pdf, zip, csv, excel...)",
    "text/*": "Text files"
}

export function StoragePropertyField({
                                         multiple,
                                         existing,
                                         disabled
                                     }: {
    multiple: boolean;
    existing: boolean;
    disabled: boolean;
}) {

    const {
        values,
        setFieldValue
    } = useFormex();

    const baseStoragePath = multiple ? "of.storage" : "storage";
    const acceptedFiles = `${baseStoragePath}.acceptedFiles`;

    const metadata = `${baseStoragePath}.metadata`;
    const fileName = `${baseStoragePath}.fileName`;
    const maxSize = `${baseStoragePath}.maxSize`;
    const storagePath = `${baseStoragePath}.storagePath`;
    const storeUrl = `${baseStoragePath}.storeUrl`;
    const includeBucketUrl = `${baseStoragePath}.includeBucketUrl`;

    // Image resize config paths
    const imageResize = `${baseStoragePath}.imageResize`;
    const imageResizeMaxWidth = `${imageResize}.maxWidth`;
    const imageResizeMaxHeight = `${imageResize}.maxHeight`;
    const imageResizeMode = `${imageResize}.mode`;
    const imageResizeFormat = `${imageResize}.format`;
    const imageResizeQuality = `${imageResize}.quality`;

    const fileNameValue = getIn(values, fileName) ?? "{rand}_{file}";
    const storagePathValue = getIn(values, storagePath) ?? "/";
    const maxSizeValue = getIn(values, maxSize);

    // Image resize values
    const imageResizeMaxWidthValue = getIn(values, imageResizeMaxWidth);
    const imageResizeMaxHeightValue = getIn(values, imageResizeMaxHeight);
    const imageResizeModeValue = getIn(values, imageResizeMode) ?? "cover";
    const imageResizeFormatValue = getIn(values, imageResizeFormat) ?? "original";
    const imageResizeQualityValue = getIn(values, imageResizeQuality);

    const storedValue = getIn(values, acceptedFiles);
    const fileTypesValue: string[] | undefined = Array.isArray(storedValue) ? storedValue : undefined;
    const allFileTypesSelected = !fileTypesValue || fileTypesValue.length === 0;

    const handleTypesChange = (value: string[]) => {
        if (!value) setFieldValue(acceptedFiles, undefined);
        else setFieldValue(acceptedFiles, value);
    };

    const hasFilenameCallback = typeof fileNameValue === "function";
    const hasStoragePathCallback = typeof storagePathValue === "function";

    return (
        <>

            <div className={"col-span-12"}>

                <ExpandablePanel
                    title={
                        <div className="flex flex-row text-surface-500 text-text-secondary dark:text-text-secondary-dark">
                            <CloudUploadIcon/>
                            <Typography variant={"subtitle2"}
                                        className="ml-4">
                                File upload config
                            </Typography>
                        </div>
                    }>

                    <div className={"grid grid-cols-12 gap-2 p-4"}>

                        <div className={"col-span-12"}>

                            <MultiSelect
                                className={"w-full"}
                                placeholder={"All file types allowed"}
                                disabled={disabled}
                                name={acceptedFiles}
                                value={fileTypesValue ?? []}
                                onValueChange={handleTypesChange}
                                label={allFileTypesSelected ? undefined : "Allowed file types"}
                                renderValues={(selected) => {
                                    if (!selected || selected.length === 0) return "All file types allowed";
                                    return selected.map((v: string) => fileTypes[v])
                                        .filter((v: string) => Boolean(v))
                                        .join(", ");
                                }}>

                                {Object.entries(fileTypes).map(([value, label]) => (
                                    <MultiSelectItem key={value} value={value} className={"flex items-center gap-2"}>
                                        {/*<Checkbox*/}
                                        {/*    checked={allFileTypesSelected || fileTypesValue.indexOf(value) > -1}/>*/}
                                        <div className={"grow"}>
                                            {label}
                                        </div>
                                        <Button size={"small"}
                                                variant={"text"}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    return setFieldValue(acceptedFiles, [value]);
                                                }}>
                                            Only
                                        </Button>
                                    </MultiSelectItem>
                                ))}

                            </MultiSelect>
                        </div>

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

                            <Field name={includeBucketUrl}
                                   type="checkbox">
                                {({
                                      field,
                                      form
                                  }: FormexFieldProps) => {
                                    return <SwitchControl
                                        label={"Include bucket URL (gs://...) in saved value"}
                                        disabled={existing || disabled}
                                        form={form}
                                        field={field}/>;
                                }}
                            </Field>

                            <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                                Turn this setting on if you want to save a fully-qualified storage URL
                                (e.g. <code>gs://my-bucket/path/to/file</code>) instead of just the storage path.
                                You can only change this prop upon creation.
                            </Typography>

                            <Field name={storeUrl}
                                   type="checkbox">
                                {({
                                      field,
                                      form
                                  }: FormexFieldProps) => {
                                    return <SwitchControl
                                        label={"Save URL instead of storage path"}
                                        disabled={existing || disabled}
                                        form={form}
                                        field={field}/>;
                                }}
                            </Field>

                            <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                                Turn this setting on, if you prefer to save
                                the download
                                URL of the uploaded file instead of the
                                storage path.
                                You can only change this prop upon creation.
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

                        <div className={"col-span-12 mt-4"}>
                            <Typography variant={"subtitle2"}
                                        color={"secondary"}
                                        className={"mb-2 block"}>
                                Image Resize Configuration
                            </Typography>
                            <Typography variant={"caption"} className={"mb-2 block text-xs"}>
                                Automatically resize and optimize images before upload (JPEG, PNG, WebP only)
                            </Typography>
                        </div>

                        <div className={"col-span-6"}>
                            <DebouncedTextField
                                name={imageResizeMaxWidth}
                                type={"number"}
                                label={"Max width (px)"}
                                size={"small"}
                                disabled={disabled}
                                value={imageResizeMaxWidthValue !== undefined && imageResizeMaxWidthValue !== null ? imageResizeMaxWidthValue.toString() : ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") setFieldValue(imageResizeMaxWidth, undefined);
                                    else setFieldValue(imageResizeMaxWidth, parseInt(value));
                                }}
                            />
                        </div>

                        <div className={"col-span-6"}>
                            <DebouncedTextField
                                name={imageResizeMaxHeight}
                                type={"number"}
                                label={"Max height (px)"}
                                size={"small"}
                                disabled={disabled}
                                value={imageResizeMaxHeightValue !== undefined && imageResizeMaxHeightValue !== null ? imageResizeMaxHeightValue.toString() : ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") setFieldValue(imageResizeMaxHeight, undefined);
                                    else setFieldValue(imageResizeMaxHeight, parseInt(value));
                                }}
                            />
                        </div>

                        <div className={"col-span-6"}>
                            <Select
                                disabled={disabled}
                                name={imageResizeMode}
                                fullWidth
                                size={"medium"}
                                value={imageResizeModeValue || "cover"}
                                onValueChange={(value) => setFieldValue(imageResizeMode, value || "cover")}
                                label={"Resize mode"}
                                renderValue={(selected) => {
                                    if (!selected) return "Cover";
                                    return selected === "contain" ? "Contain (fit within bounds)" : "Cover (fill bounds, may crop)";
                                }}>
                                <SelectItem value="contain">
                                    Contain (fit within bounds)
                                </SelectItem>
                                <SelectItem value="cover">
                                    Cover (fill bounds, may crop)
                                </SelectItem>
                            </Select>
                        </div>

                        <div className={"col-span-6"}>
                            <Select
                                disabled={disabled}
                                size={"medium"}
                                fullWidth
                                name={imageResizeFormat}
                                value={imageResizeFormatValue || "original"}
                                onValueChange={(value) => setFieldValue(imageResizeFormat, value || "original")}
                                label={"Output format"}
                                renderValue={(selected) => {
                                    if (!selected) return "Original";
                                    return selected.charAt(0).toUpperCase() + selected.slice(1);
                                }}>
                                <SelectItem value="original">
                                    Original (keep same format)
                                </SelectItem>
                                <SelectItem value="jpeg">
                                    JPEG
                                </SelectItem>
                                <SelectItem value="png">
                                    PNG
                                </SelectItem>
                                <SelectItem value="webp">
                                    WebP (best compression)
                                </SelectItem>
                            </Select>
                        </div>

                        <div className={"col-span-12"}>
                            <DebouncedTextField
                                name={imageResizeQuality}
                                type={"number"}
                                label={"Quality (0-100)"}
                                size={"small"}
                                disabled={disabled}
                                value={imageResizeQualityValue !== undefined && imageResizeQualityValue !== null ? imageResizeQualityValue.toString() : ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") setFieldValue(imageResizeQuality, undefined);
                                    else {
                                        const numValue = parseInt(value);
                                        if (numValue >= 0 && numValue <= 100) {
                                            setFieldValue(imageResizeQuality, numValue);
                                        }
                                    }
                                }}
                            />
                            <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                                Higher quality = larger file size. Recommended: 80-90 for photos, 90-100 for graphics
                            </Typography>
                        </div>

                    </div>
                </ExpandablePanel>

            </div>

            <div className={"col-span-12"}>

                <ValidationPanel>
                    {!multiple && <div className={"grid grid-cols-12 gap-2"}>
                        <GeneralPropertyValidation disabled={disabled}/>
                    </div>}
                    {multiple && <div className={"col-span-12"}>
                        <ArrayPropertyValidation disabled={disabled}/>
                    </div>}
                </ValidationPanel>

            </div>
        </>
    );
}
