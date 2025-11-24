import { FirebaseApp } from "@firebase/app";
import {
    deleteObject,
    getDownloadURL,
    getMetadata,
    getStorage,
    list,
    ref,
    uploadBytesResumable
} from "@firebase/storage";
import { DownloadConfig, DownloadMetadata, StorageListResult, StorageSource, UploadFileProps } from "@firecms/core";

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
export function useFirebaseStorageSource({
                                             firebaseApp,
                                             bucketUrl
                                         }: FirebaseStorageSourceProps): StorageSource {
    const projectId = firebaseApp?.options?.projectId;
    const urlsCache: Record<string, DownloadConfig> = {};
    return {
        uploadFile({
                       file,
                       fileName,
                       path,
                       metadata,
                       bucket
                   }: UploadFileProps)
            : Promise<any> {
            try {
                if (!firebaseApp) throw Error("useFirebaseStorageSource Firebase not initialised");
                const storageBucketUrl = bucket ?? bucketUrl;
                const storage = getStorage(firebaseApp, storageBucketUrl);
                if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
                const usedFilename = fileName ?? file.name;

                const storageRef = ref(storage, `${path}/${usedFilename}`);
                const uploadTask = uploadBytesResumable(storageRef, file, metadata);

                return new Promise((resolve, reject) => {
                    let lastProgress = 0;
                    let timeoutId: NodeJS.Timeout | null = null;

                    const clearTimeoutIfExists = () => {
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                            timeoutId = null;
                        }
                    };

                    const setProgressTimeout = () => {
                        clearTimeoutIfExists();
                        timeoutId = setTimeout(() => {
                            uploadTask.cancel();
                            reject(new Error("Upload failed - This is likely a CORS configuration issue. " +
                                "Make sure Firebase Storage is enabled in your project: " + `https://console.firebase.google.com/u/0/project/${projectId}/storage` + ". " +
                                "If it is, check Firebase Storage CORS settings."));
                        }, 5000);
                    };

                    setProgressTimeout();

                    uploadTask.on("state_changed",
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                            if (progress > lastProgress) {
                                lastProgress = progress;
                                setProgressTimeout();
                            }
                        },
                        (error) => {
                            clearTimeoutIfExists();
                            console.error("Firebase Storage upload error:", error);

                            let errorMessage = "Unknown upload error";

                            if (error?.message) {
                                errorMessage = error.message;
                            } else if (typeof error === "string") {
                                errorMessage = error;
                            } else if (error?.code) {
                                errorMessage = error.code;
                            }

                            if (error?.code === "storage/unauthorized") {
                                reject(new Error("Unauthorized: Check Firebase Storage security rules"));
                            } else if (error?.code === "storage/canceled") {
                                reject(new Error("Upload canceled"));
                            } else if (error?.code === "storage/unknown" || !error?.code) {
                                reject(new Error("Upload failed - Check Firebase Storage CORS configuration or network connection"));
                            } else if (errorMessage.toLowerCase().includes("network")) {
                                reject(new Error("Network error: Check your internet connection"));
                            } else {
                                const newError = new Error(errorMessage);
                                (newError as any).code = error?.code;
                                reject(newError);
                            }
                        },
                        () => {
                            clearTimeoutIfExists();
                            resolve({
                                path: uploadTask.snapshot.ref.fullPath
                            });
                        }
                    );
                });
            } catch (error) {
                return Promise.reject(error);
            }
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
                if (e?.code === "storage/object-not-found") return {
                    url: null,
                    fileNotFound: true
                };
                throw e;
            }
        },

        async list(path: string, options?: {
            bucket?: string,
            maxResults?: number,
            pageToken?: string
        }): Promise<StorageListResult> {
            if (!firebaseApp) throw Error("useFirebaseStorageSource Firebase not initialised");
            const storageBucketUrl = options?.bucket ?? bucketUrl;
            const storage = getStorage(firebaseApp, storageBucketUrl);
            if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
            const folderRef = ref(storage, path);
            return await list(folderRef, {
                maxResults: options?.maxResults,
                pageToken: options?.pageToken
            });
        },

        async deleteFile(path: string, bucket?: string): Promise<void> {
            if (!firebaseApp) throw Error("useFirebaseStorageSource Firebase not initialised");
            const storageBucketUrl = bucket ?? bucketUrl;
            const storage = getStorage(firebaseApp, storageBucketUrl);
            if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
            const fileRef = ref(storage, path);
            return deleteObject(fileRef);
        }
    };
}
