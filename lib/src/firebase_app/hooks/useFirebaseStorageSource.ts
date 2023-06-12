import { FirebaseApp } from "firebase/app";
import { FirebaseStorage, getDownloadURL, getMetadata, getStorage, ref, uploadBytes } from "firebase/storage";
import { DownloadConfig, DownloadMetadata, StorageSource, UploadFileProps } from "../../types";
import { useEffect, useState } from "react";

/**
 * @category Firebase
 */
export interface FirebaseStorageSourceProps {
    firebaseApp?: FirebaseApp
}

/**
 * Use this hook to build an {@link StorageSource} based on Firebase storage
 * @category Firebase
 */
export function useFirebaseStorageSource({ firebaseApp }: FirebaseStorageSourceProps): StorageSource {

    const [storage, setStorage] = useState<FirebaseStorage>();

    useEffect(() => {
        if (!firebaseApp) return;
        setStorage(getStorage(firebaseApp));
    }, [firebaseApp]);

    const urlsCache: Record<string, DownloadConfig> = {};

    return {
        uploadFile({ file, fileName, path, metadata }: UploadFileProps)
            : Promise<any> {
            if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
            const usedFilename = fileName ?? file.name;
            console.debug("Uploading file", usedFilename, file, path, metadata);
            return uploadBytes(ref(storage, `${path}/${usedFilename}`), file, metadata).then(snapshot => ({
                path: snapshot.ref.fullPath
            }));
        },

        async getFile(path: string): Promise<File | null> {
            try {

                if (!storage)
                    throw Error("useFirebaseStorageSource Firebase not initialised");
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

        async getDownloadURL(storagePathOrUrl: string): Promise<DownloadConfig> {
            if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
            if (urlsCache[storagePathOrUrl])
                return urlsCache[storagePathOrUrl];
            const fileRef = ref(storage, storagePathOrUrl);
            const [url, metadata] = await Promise.all([getDownloadURL(fileRef), getMetadata(fileRef)]);
            const result: DownloadConfig = {
                url, metadata: metadata as DownloadMetadata
            }
            urlsCache[storagePathOrUrl] = result;
            return result;
        }
    };
}
