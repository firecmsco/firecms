export function isMediaCompatible(asset: { mimeType: string; size: number }, acceptedFiles?: string[], _maxSize?: number): boolean {
    if (!acceptedFiles?.length) return true;
    const mime = asset.mimeType.toLowerCase();
    return acceptedFiles.some(type => {
        const accepted = type.toLowerCase();
        return accepted.endsWith("/*") ? mime.startsWith(accepted.slice(0, -1)) : mime === accepted;
    });
}

export function mergeMediaSelection(current: string | string[] | null, selected: string[], multiple: boolean): string | string[] | null {
    if (!multiple) return selected[0] ?? null;
    return [...new Set([...(Array.isArray(current) ? current : []), ...selected])];
}
