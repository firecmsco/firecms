import { storage } from "firebase/app";

export function uploadFile(file: File,
                           path?: string,
                           metadata?: storage.UploadMetadata)
    : storage.UploadTask {
    console.log("Uploading file", file, path, metadata);
    return storage().ref().child(`${path}/${file.name}`).put(file, metadata);
}

const memo = {};
export function getDownloadURL(storagePath: string): Promise<string> {
    if (memo[storagePath])
        return memo[storagePath];
    const downloadURL = storage().ref(storagePath).getDownloadURL();
    memo[storagePath] = downloadURL;
    return downloadURL;
}
