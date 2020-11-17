import firebase from "firebase/app";

export function uploadFile(file: File,
                           path?: string,
                           metadata?: firebase.storage.UploadMetadata)
    : firebase.storage.UploadTask {
    console.debug("Uploading file", file, path, metadata);
    return firebase.storage().ref().child(`${path}/${file.name}`).put(file, metadata);
}

const memo = {};
export function getDownloadURL(storagePath: string): Promise<string> {
    if (memo[storagePath])
        return memo[storagePath];
    const downloadURL = firebase.storage().ref(storagePath).getDownloadURL();
    memo[storagePath] = downloadURL;
    return downloadURL;
}
