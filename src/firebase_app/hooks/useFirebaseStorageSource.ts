import { FirebaseApp } from "firebase/app";
import {
    FirebaseStorage,
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes
} from "firebase/storage";
import { StorageSource, UploadFileProps } from "../../models/storage";

export type FirebaseStorageSourceProps = {
    firebaseApp: FirebaseApp
};

/**
 * Use this hook to build an {@link StorageSource} based on Firebase storage
 * @category Firebase
 */
export function useFirebaseStorageSource({ firebaseApp }: FirebaseStorageSourceProps): StorageSource {

    const storage: FirebaseStorage = getStorage(firebaseApp);
    const urlsCache: any = {};

    return {
        uploadFile({ file, fileName, path, metadata }: UploadFileProps)
            : Promise<any> {
            const usedFilename = fileName ?? file.name;
            console.debug("Uploading file", usedFilename, file, path, metadata);
            return uploadBytes(ref(storage, `${path}/${usedFilename}`), file, metadata).then(snapshot => ({
                path: snapshot.ref.fullPath
            }));
        },

        getDownloadURL(storagePath: string): Promise<string> {
            if (urlsCache[storagePath])
                return urlsCache[storagePath];
            const downloadURL = getDownloadURL(ref(storage, storagePath));
            urlsCache[storagePath] = downloadURL;
            return downloadURL;
        }
    };
}
