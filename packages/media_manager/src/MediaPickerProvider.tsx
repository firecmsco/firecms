import React, { PropsWithChildren, useCallback, useMemo, useRef, useState } from "react";
import { MediaPickerContext, MediaPickerRequest, isMediaCompatible } from "@firecms/core";
import { Button, Dialog, DialogActions, DialogContent, Typography } from "@firecms/ui";
import { MediaManagerConfig } from "./types/index.js";
import { MediaAssetCard } from "./components/MediaAssetCard.js";
import { MediaAsset } from "./types/media_asset.js";
import { registerMediaAsset } from "./media_catalog.js";
import { loadMediaPreviews } from "./media_previews.js";

const PAGE_SIZE = 40;

export function MediaPickerProvider({ config, children }: PropsWithChildren<{ config: MediaManagerConfig }>) {
    const [request, setRequest] = useState<MediaPickerRequest>();
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [selected, setSelected] = useState<MediaAsset[]>([]);
    const [cursor, setCursor] = useState<string>();
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const generation = useRef(0);
    const collectionPath = config.collectionPath ?? "media_assets";

    const loadPage = useCallback(async (after?: string, currentGeneration = generation.current) => {
        setLoading(true);
        setError(undefined);
        try {
            const rows = await config.dataSourceDelegate.fetchCollection({
                path: collectionPath, orderBy: "__name__", order: "asc", limit: PAGE_SIZE,
                ...(after ? { startAfter: after } : {})
            });
            if (generation.current !== currentGeneration) return;
            const page = rows.map(row => ({ ...row.values, id: row.id } as MediaAsset));
            setAssets(previous => after ? [...previous, ...page] : page);
            setCursor(rows.at(-1)?.id);
            setHasMore(rows.length === PAGE_SIZE);
            void loadMediaPreviews(page, async asset => asset.mimeType?.startsWith("image/")
                ? (await config.storageSource.getDownloadURL(asset.storagePath, asset.bucket)).url ?? undefined
                : undefined, (id, url) => {
                if (generation.current === currentGeneration) setAssets(previous => previous.map(asset => asset.id === id ? { ...asset, downloadURL: url } : asset));
            });
        } catch (e) {
            if (generation.current === currentGeneration) setError(e instanceof Error ? e.message : String(e));
        } finally { if (generation.current === currentGeneration) setLoading(false); }
    }, [collectionPath, config.dataSourceDelegate, config.storageSource]);

    const registerUpload = useCallback(async (file: File, storagePath: string, bucket?: string) => {
        const bytes = new TextEncoder().encode(`${bucket ?? ""}\n${storagePath}`);
        const hash = await crypto.subtle.digest("SHA-256", bytes);
        const entityId = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
        await registerMediaAsset({ fileName: file.name, storagePath, mimeType: file.type, size: file.size, ...(bucket ? { bucket } : {}) },
            values => config.dataSourceDelegate.saveEntity({ path: collectionPath, entityId, status: "new", values }));
    }, [collectionPath, config.dataSourceDelegate]);

    const open = useCallback((next: MediaPickerRequest) => {
        const currentGeneration = ++generation.current;
        setSelected([]); setAssets([]); setCursor(undefined); setHasMore(false); setRequest(next);
        void loadPage(undefined, currentGeneration);
    }, [loadPage]);
    const controller = useMemo(() => ({ open, registerUpload }), [open, registerUpload]);

    return <MediaPickerContext.Provider value={controller}>
        {children}
        <Dialog open={!!request} onOpenChange={open => { if (!open) { generation.current++; setRequest(undefined); } }} maxWidth="lg">
            <DialogContent>
                <Typography variant="h6">Choose from media library</Typography>
                {error && <p role="alert">{error}</p>}
                {!loading && !assets.length && !error && <p>No files in the media library yet.</p>}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[55vh] overflow-auto my-4">
                    {assets.map(asset => {
                        const compatible = isMediaCompatible(asset, request?.acceptedFiles);
                        const checked = selected.some(item => item.id === asset.id);
                        return <div key={asset.id} className={compatible ? "" : "opacity-40"}>
                            <MediaAssetCard asset={asset} viewMode="grid" selected={checked} onClick={() => {
                                if (!compatible) return;
                                setSelected(previous => checked ? previous.filter(item => item.id !== asset.id) : request?.multiple ? [...previous, asset] : [asset]);
                            }}/>
                        </div>;
                    })}
                </div>
                {loading && <p>Loading files…</p>}
                {hasMore && <Button disabled={loading} onClick={() => void loadPage(cursor)}>Load more</Button>}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setRequest(undefined)}>Cancel</Button>
                <Button disabled={!selected.length} onClick={() => { request?.onSelect(selected); setRequest(undefined); }}>Select</Button>
            </DialogActions>
        </Dialog>
    </MediaPickerContext.Provider>;
}
