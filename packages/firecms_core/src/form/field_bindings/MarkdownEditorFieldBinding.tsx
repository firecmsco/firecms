import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    FieldHelperText,
    FieldProps,
    getIconForProperty,
    LabelWithIconAndTooltip,
    randomString,
    useStorageSource
} from "../../index";
import { cls, fieldBackgroundHoverMixin, fieldBackgroundMixin } from "@firecms/ui";
import { FireCMSEditor, FireCMSEditorProps } from "@firecms/editor";
import { resolveStorageFilenameString, resolveStoragePathString } from "../../util";

interface MarkdownEditorFieldProps {
    highlight?: { from: number, to: number };
    editorProps?: Partial<FireCMSEditorProps>
}

export function MarkdownEditorFieldBinding({
                                               property,
                                               propertyKey,
                                               value,
                                               setValue,
                                               includeDescription,
                                               showError,
                                               error,
                                               minimalistView,
                                               isSubmitting,
                                               context,
                                               customProps,
                                           }: FieldProps<string, MarkdownEditorFieldProps>) {

    const highlight = customProps?.highlight;
    const editorProps = customProps?.editorProps;
    const storageSource = useStorageSource();
    const storage = property.storage;

    const entityValues = context.values;
    const entityId = context.entityId;
    const path = context.path;

    // const fieldVersion = useRef(0);
    const [fieldVersion, setFieldVersion] = useState(0);
    const internalValue = useRef(value);

    const onContentChange = useCallback((content: string) => {
        internalValue.current = content;
        setValue(content);
    }, [setValue]);

    useEffect(() => {
        if (internalValue.current !== value) {
            internalValue.current = value;
            setFieldVersion(fieldVersion + 1);
            // fieldVersion.current = fieldVersion.current + 1;
        }
    }, [value]);

    const fileNameBuilder = useCallback(async (file: File) => {
        if (storage?.fileName) {
            const fileName = await resolveStorageFilenameString({
                input: storage.fileName,
                storage,
                values: entityValues,
                entityId,
                path,
                property,
                file,
                propertyKey
            });
            if (!fileName || fileName.length === 0) {
                throw Error("You need to return a valid filename");
            }
            return fileName;
        }
        return randomString() + "_" + file.name;
    }, [entityId, entityValues, path, property, propertyKey, storage]);

    const storagePathBuilder = useCallback((file: File) => {
        if (!storage) return "/";
        return resolveStoragePathString({
            input: storage.storagePath,
            storage,
            values: entityValues,
            entityId,
            path,
            property,
            file,
            propertyKey
        }) ?? "/";
    }, [entityId, entityValues, path, property, propertyKey, storage]);

    const editor = <FireCMSEditor
        content={value}
        onMarkdownContentChange={onContentChange}
        version={context.formex.version + fieldVersion}
        highlight={highlight}
        handleImageUpload={async (file: File) => {
            const storagePath = storagePathBuilder(file);
            const fileName = await fileNameBuilder(file);
            const result = await storageSource.uploadFile({
                file,
                fileName,
                path: storagePath,
            });
            const downloadConfig = await storageSource.getDownloadURL(result.path);
            const url = downloadConfig.url;
            if (!url) {
                throw new Error("Error uploading image");
            }
            return url;
        }}
        {...editorProps}
        />;

    if (minimalistView)
        return editor;

    return (
        <>
            <LabelWithIconAndTooltip
                propertyKey={propertyKey}
                icon={getIconForProperty(property, "small")}
                required={property.validation?.required}
                title={property.name}
                className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>
            <div className={cls("rounded-md", fieldBackgroundMixin, fieldBackgroundHoverMixin)}>
                {editor}
            </div>
            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>
        </>

    );

}
