import { storage } from "firebase/app";

export function uploadFile(file: File,
                           path?: string,
                           metadata?: storage.UploadMetadata)
    : storage.UploadTask {
    console.log("Uploading file", file, path, metadata);
    return storage().ref().child(`${path}/${file.name}`).put(file, metadata);
}

export function getDownloadURL(storagePath: string): Promise<string> {
    return storage().ref(storagePath).getDownloadURL();
}
