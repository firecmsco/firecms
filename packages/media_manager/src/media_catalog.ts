export interface MediaRegistration {
    fileName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    bucket?: string;
}

export async function registerMediaAsset(asset: MediaRegistration, save: (values: MediaRegistration & { createdAt: Date; updatedAt: Date }) => Promise<unknown>): Promise<void> {
    const now = new Date();
    await save({ ...asset, createdAt: now, updatedAt: now });
}
