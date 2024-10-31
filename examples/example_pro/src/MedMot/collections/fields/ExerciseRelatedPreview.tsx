import { PropertyPreviewProps, useStorageSource } from "@firecms/core";
import { useEffect, useState } from "react";
import ExerciseTitle from "./ExerciseTitlePreview";
import { collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";

export default function ExerciseRelatedPreview({
    height,
    width,
    property,
    customProps,
    value
}: PropertyPreviewProps<any[] | any>) {

    const [image, setImage] = useState<string | undefined>(undefined);

    const storage = useStorageSource();

    useEffect(() => {

        const firestore = getFirestore();
        getDoc(doc(collection(firestore, value.path), value.id)).then(
            (snapshot: any) => {
                setImage(snapshot.get("image") as string)
                storage.getDownloadURL(snapshot.get("image") as string)
                .then((res) => setImage(res.url as string));
            }
        )

    }, [value.id]);

    return (
        <>
        {image != undefined &&
            <img width={100} height={70} src={image} style={{borderRadius:5}} />
        }
        <ExerciseTitle entity={value} /></>
    )



}
