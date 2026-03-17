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
import { useTranslation } from "@firecms/core";

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

    const { t } = useTranslation();

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

    const fileTypes: Record<string, string> = {
        "image/*": t("file_type_images"),
        "video/*": t("file_type_videos"),
        "audio/*": t("file_type_audio"),
        "application/*": t("file_type_applications"),
        "text/*": t("file_type_text")
    };

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
                                {t("file_upload_config")}
                            </Typography>
                        </div>
                    }>

                    <div className={"grid grid-cols-12 gap-2 p-4"}>

                        <div className={"col-span-12"}>

                            <MultiSelect
                                className={"w-full"}
                                placeholder={t("all_file_types_allowed")}
                                disabled={disabled}
                                name={acceptedFiles}
                                value={fileTypesValue ?? []}
                                onValueChange={handleTypesChange}
                                label={allFileTypesSelected ? undefined : t("allowed_file_types")}
                                renderValues={(selected) => {
                                    if (!selected || selected.length === 0) return t("all_file_types_allowed");
                                    return selected.map((v: string) => fileTypes[v])
                                        .filter((v: string) => Boolean(v))
                                        .join(", ");
                                }}>

                                {Object.entries(fileTypes).map(([value, label]) => (
                                    <MultiSelectItem key={value} value={value} className={"flex items-center gap-2"}>
                                        {/*<Checkbox*/}
                                        {/*    checked={allFileTypesSelected || fileTypesValue.indexOf(value) > -1}/>*/}
                                        <div className={"flex-grow"}>
                                            {label}
                                        </div>
                                        <Button size={"small"}
                                                variant={"text"}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    return setFieldValue(acceptedFiles, [value]);
                                                }}>
                                            {t("only")}
                                        </Button>
                                    </MultiSelectItem>
                                ))}

                            </MultiSelect>
                        </div>

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

                            <Field name={includeBucketUrl}
                                   type="checkbox">
                                {({
                                      field,
                                      form
                                  }: FormexFieldProps) => {
                                    return <SwitchControl
                                        label={t("include_bucket_url")}
                                        disabled={existing || disabled}
                                        form={form}
                                        field={field}/>;
                                }}
                            </Field>

                            <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                                {t("include_bucket_url_description")}
                            </Typography>

                            <Field name={storeUrl}
                                   type="checkbox">
                                {({
                                      field,
                                      form
                                  }: FormexFieldProps) => {
                                    return <SwitchControl
                                        label={t("save_url_instead_of_path")}
                                        disabled={existing || disabled}
                                        form={form}
                                        field={field}/>;
                                }}
                            </Field>

                            <Typography variant={"caption"} className={"ml-3.5 mt-1 mb-2"}>
                                {t("save_url_description")}
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

                        <div className={"col-span-12 mt-4"}>
                            <Typography variant={"subtitle2"}
                                        color={"secondary"}
                                        className={"mb-2 block"}>
                                {t("image_resize_configuration")}
                            </Typography>
                            <Typography variant={"caption"} className={"mb-2 block text-xs"}>
                                {t("image_resize_description")}
                            </Typography>
                        </div>

                        <div className={"col-span-6"}>
                            <DebouncedTextField
                                name={imageResizeMaxWidth}
                                type={"number"}
                                label={t("max_width_px")}
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
                                label={t("max_height_px")}
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
                                label={t("resize_mode")}
                                renderValue={(selected) => {
                                    if (!selected) return t("resize_cover");
                                    return selected === "contain" ? t("resize_contain_description") : t("resize_cover_description");
                                }}>
                                <SelectItem value="contain">
                                    {t("resize_contain_description")}
                                </SelectItem>
                                <SelectItem value="cover">
                                    {t("resize_cover_description")}
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
                                label={t("output_format")}
                                renderValue={(selected) => {
                                    if (!selected) return t("format_original");
                                    return selected.charAt(0).toUpperCase() + selected.slice(1);
                                }}>
                                <SelectItem value="original">
                                    {t("format_original_description")}
                                </SelectItem>
                                <SelectItem value="jpeg">
                                    JPEG
                                </SelectItem>
                                <SelectItem value="png">
                                    PNG
                                </SelectItem>
                                <SelectItem value="webp">
                                    {t("format_webp_description")}
                                </SelectItem>
                            </Select>
                        </div>

                        <div className={"col-span-12"}>
                            <DebouncedTextField
                                name={imageResizeQuality}
                                type={"number"}
                                label={t("quality_label")}
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
                                {t("quality_hint")}
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
