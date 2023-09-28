import React from "react";
import { useDropzone } from "react-dropzone";
import { fieldBackgroundHoverMixin, fieldBackgroundMixin, focusedMixin } from "../styles";
import { cn } from "./util/cn";
import { Typography } from "./Typography";

export interface FileUploadError {
    message: string;
    code: string;
}

export type OnFileUploadRejected = (fileRejections: {
    file: File;
    errors: FileUploadError[];
}[], event: object) => void;

export type OnFilesUploadAdded = (files: File[]) => void;

export type FileUploadProps = {
    // e.g. accept={{ "*/image": [] }}
    accept: Record<string, string[]>,
    onFilesAdded: OnFilesUploadAdded,
    onFilesRejected?: OnFileUploadRejected,
    maxSize?: number,
    disabled?: boolean;
    maxFiles?: number;
    title?: React.ReactNode;
    uploadDescription?: React.ReactNode;
    preventDropOnDocument?: boolean;
    size?: "small" | "medium";
};

export function FileUpload({
                               accept,
                               onFilesAdded,
                               onFilesRejected,
                               maxSize,
                               disabled,
                               maxFiles,
                               title,
                               uploadDescription = "Drag and drop a file here or click",
                               children,
                               preventDropOnDocument = true,
    size
                           }: React.PropsWithChildren<FileUploadProps>) {

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
            accept,
            noDragEventsBubbling: true,
            maxSize,
            onDrop: onFilesAdded,
            onDropRejected: onFilesRejected,
            disabled,
            maxFiles,
            preventDropOnDocument
        }
    );
    return <div
        {...getRootProps()}
        className={cn(
            fieldBackgroundMixin,
            fieldBackgroundHoverMixin,
            focusedMixin,
            "flex gap-2",
            "p-4 box-border relative items-center border-2 border-solid border-transparent outline-none rounded-md duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-primary-solid",
            {
                "h-44": size === "medium",
                "h-28": size === "small",
                "cursor-pointer": !disabled,
                "hover:bg-field-hover dark:hover:bg-field-hover-dark": !isDragActive,
                "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-red-500": isDragReject,
                "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-green-500": isDragAccept,
            })}
    >

        <Typography variant={"caption"} color={"secondary"} className={"absolute top-2 left-3.5 cursor-inherit"}>
            {title}
        </Typography>

        <input
            {...getInputProps()} />

        {children}

        <div
            className="flex-grow h-28 box-border flex flex-col items-center justify-center text-center">
            <Typography align={"center"}
                        variant={"label"}>
                {uploadDescription}
            </Typography>
        </div>

    </div>
}
