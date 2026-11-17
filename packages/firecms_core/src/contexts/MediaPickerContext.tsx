import React, { createContext, useContext } from "react";

export interface MediaPickerAsset {
    storagePath: string;
    bucket?: string;
    mimeType: string;
    size: number;
}

export interface MediaPickerRequest {
    multiple: boolean;
    acceptedFiles?: string[];
    onSelect: (assets: MediaPickerAsset[]) => void;
}

export interface MediaPickerController {
    open: (request: MediaPickerRequest) => void;
    registerUpload: (file: File, storagePath: string, bucket?: string) => Promise<void>;
}

export const MediaPickerContext = createContext<MediaPickerController | undefined>(undefined);

export function useMediaPicker(): MediaPickerController | undefined {
    return useContext(MediaPickerContext);
}
