import firebase from "firebase/app";

/**
 * @category Storage
 */
export function uploadFile(file: File,
                           fileName?: string,
                           path?: string,
                           metadata?: firebase.storage.UploadMetadata)
    : firebase.storage.UploadTask {
    const usedFilename = fileName ?? file.name;
    console.debug("Uploading file", usedFilename, file, path, metadata);
    return firebase.storage()
        .ref()
        .child(`${path}/${usedFilename}`)
        .put(file, metadata);
}

const memo: any = {};

/**
 * @category Storage
 */
export function getDownloadURL(storagePath: string): Promise<string> {
    if (memo[storagePath])
        return memo[storagePath];
    const downloadURL = firebase.storage().ref(storagePath).getDownloadURL();
    memo[storagePath] = downloadURL;
    return downloadURL;
}
