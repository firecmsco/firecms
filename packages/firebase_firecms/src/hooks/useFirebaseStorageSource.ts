import { FirebaseApp } from "@firebase/app";
import { getDownloadURL, getMetadata, getStorage, ref, uploadBytes } from "@firebase/storage";
import { DownloadConfig, DownloadMetadata, StorageSource, UploadFileProps } from "@firecms/core";

/**
 * @group Firebase
 */
export interface FirebaseStorageSourceProps {
    firebaseApp?: FirebaseApp
    bucketUrl?: string
}

/**
 * Use this hook to build an {@link StorageSource} based on Firebase storage
 * @group Firebase
 */
export function useFirebaseStorageSource({ firebaseApp, bucketUrl }: FirebaseStorageSourceProps): StorageSource {
    const urlsCache: Record<string, DownloadConfig> = {};
    return {
        uploadFile({ file, fileName, path, metadata, bucket }: UploadFileProps)
            : Promise<any> {
            if (!firebaseApp) throw Error("useFirebaseStorageSource Firebase not initialised");
            const storageBucketUrl = bucket ?? bucketUrl;
            const storage = getStorage(firebaseApp, storageBucketUrl);
            if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
            const usedFilename = fileName ?? file.name;
            console.debug("Uploading file", usedFilename, file, path, metadata);
            return uploadBytes(ref(storage, `${path}/${usedFilename}`), file, metadata).then(snapshot => ({
                path: snapshot.ref.fullPath
            }));
        },

        async getFile(path: string, bucket?: string): Promise<File | null> {
            try {
                if (!firebaseApp) throw Error("useFirebaseStorageSource Firebase not initialised");
                const storageBucketUrl = bucket ?? bucketUrl;
                const storage = getStorage(firebaseApp, storageBucketUrl);
                if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
                const fileRef = ref(storage, path);
                const url = await getDownloadURL(fileRef);
                const response = await fetch(url);
                const blob = await response.blob();
                return new File([blob], path);
            } catch (e: any) {
                if (e?.code === "storage/object-not-found") return null;
                throw e;
            }
        },

        async getDownloadURL(storagePathOrUrl: string, bucket?: string): Promise<DownloadConfig> {
            if (!firebaseApp) throw Error("useFirebaseStorageSource Firebase not initialised");
            const storageBucketUrl = bucket ?? bucketUrl;
            const storage = getStorage(firebaseApp, storageBucketUrl);
            if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
            if (urlsCache[storagePathOrUrl])
                return urlsCache[storagePathOrUrl];
            try {
                const fileRef = ref(storage, storagePathOrUrl);
                const [url, metadata] = await Promise.all([getDownloadURL(fileRef), getMetadata(fileRef)]);
                const result: DownloadConfig = {
                    url,
                    metadata: metadata as DownloadMetadata
                }
                urlsCache[storagePathOrUrl] = result;
                return result;
            } catch (e: any) {
                if (e?.code === "storage/object-not-found") return { url: null, fileNotFound: true };
                throw e;
            }
        }
    };
}
