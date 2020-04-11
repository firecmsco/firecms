import * as firebase from "firebase";
import "firebase/storage";

export function uploadFile(file: File, path?: string): firebase.storage.UploadTask {
    const storageRef = firebase.storage().ref();
    return storageRef.child(`${path}/${file.name}`).put(file);
}

export function getDownloadURL(storagePath: string): Promise<string> {
    return firebase.storage().ref(storagePath).getDownloadURL();
}
