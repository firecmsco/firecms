import { storage } from "firebase/app";


export function uploadFile(file: File, path?: string): firebase.storage.UploadTask {
    const storageRef = storage().ref();
    return storageRef.child(`${path}/${file.name}`).put(file);
}

export function getDownloadURL(storagePath: string): Promise<string> {
    return storage().ref(storagePath).getDownloadURL();
}
