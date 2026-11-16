export async function loadMediaPreviews<T extends { id: string }>(assets: T[], resolve: (asset: T) => Promise<string | undefined>, publish: (id: string, url: string) => void): Promise<void> {
    await Promise.all(assets.map(async asset => {
        try {
            const url = await resolve(asset);
            if (url) publish(asset.id, url);
        } catch (error) {
            console.warn("Media preview unavailable", error);
        }
    }));
}
