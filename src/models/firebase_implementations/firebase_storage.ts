import { FirebaseApp } from "firebase/app";
import {
    FirebaseStorage,
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes,
    UploadMetadata
} from "firebase/storage";
import { StorageSource } from "../storage";

export function useFirebaseStorageSource(firebaseApp: FirebaseApp):StorageSource {

    const storage: FirebaseStorage = getStorage(firebaseApp);
    const urlsCache: any = {};

    return {
        /**
         * @category Storage
         */
        uploadFile(file: File,
                   fileName?: string,
                   path?: string,
                   metadata?: UploadMetadata)
            : Promise<any> {
            const usedFilename = fileName ?? file.name;
            console.debug("Uploading file", usedFilename, file, path, metadata);
            return uploadBytes(ref(storage, `${path}/${usedFilename}`), file, metadata).then(snapshot => ({
                path: snapshot.ref.fullPath
            }));
        },

        /**
         * @category Storage
         */
        getDownloadURL(storagePath: string): Promise<string> {
            if (urlsCache[storagePath])
                return urlsCache[storagePath];
            const downloadURL = getDownloadURL(ref(storage, storagePath));
            urlsCache[storagePath] = downloadURL;
            return downloadURL;
        }
    };
}
