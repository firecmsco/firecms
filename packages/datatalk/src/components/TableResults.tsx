import { useEffect, useState } from "react";
import { doc, DocumentReference, getFirestore, QuerySnapshot, setDoc } from "firebase/firestore";
import {
    Entity,
    EntityCollection,
    EntityCollectionTable,
    OnCellValueChange,
    Properties,
    useSelectionController
} from "@firecms/core";
import { setIn } from "@firecms/formex";
import { cmsToFirestoreModel, firestoreToCMSModel } from "@firecms/firebase";
import { Typography } from "@firecms/ui";
import { BasicExportAction } from "@firecms/data_import_export";
import { getPropertiesFromData } from "@firecms/collection_editor_firebase";
import { buildPropertiesOrder } from "@firecms/schema_inference";

export function TableResults({
                                 querySnapshot,
                                 priorityKeys,
                                 collections
                             }: {
    querySnapshot: QuerySnapshot,
    priorityKeys?: string[],
    collections?: EntityCollection[]
}) {
    async function inferProperties() {
        const entities = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            path: doc.ref.path,
            values: firestoreToCMSModel(doc.data())
        }));

        const docs = querySnapshot.docs.map((doc: any) => doc.data());
        const inferredProperties = await getPropertiesFromData(docs);
        const inferredPropertiesOrder = buildPropertiesOrder(inferredProperties, priorityKeys);
        setQueryResults(entities);
        setProperties(inferredProperties);
        setPropertiesOrder(inferredPropertiesOrder)
    }

    useEffect(() => {
        inferProperties();
    }, []);

    const [queryResults, setQueryResults] = useState<Entity<any>[] | null>(null);
    const [properties, setProperties] = useState<Properties | null>(null);
    const [propertiesOrder, setPropertiesOrder] = useState<string[] | null>(null);

    const selectionController = useSelectionController();
    const displayedColumnIds = (propertiesOrder ?? Object.keys(properties ?? {}))
        .map((key) => ({
            key,
            disabled: false
        }));

    const onValueChange: OnCellValueChange<any, any> = ({
                                                            value,
                                                            propertyKey,
                                                            onValueUpdated,
                                                            setError,
                                                            data: entity
                                                        }) => {

        const updatedValues = setIn({ ...entity.values }, propertyKey, value);

        const firestore = getFirestore();
        const firebaseValues = cmsToFirestoreModel(updatedValues, firestore);
        console.log("Saving", firebaseValues, entity);
        console.log("Firestore", firestore);
        const documentReference: DocumentReference = doc(firestore, entity.path);
        console.log("Document reference", documentReference)
        return setDoc(documentReference, firebaseValues, { merge: true })
            .then((res) => {
                console.log("Document updated", res);
                onValueUpdated();
            })
            .catch((error) => {
                console.error("Error updating document", error);
                setError(error);
            });

    };

    if (!queryResults || !properties) return null;

    return <EntityCollectionTable
        inlineEditing={true}
        defaultSize={"s"}
        selectionController={selectionController}
        onValueChange={onValueChange}
        filterable={false}
        actionsStart={<Typography
            variant={"caption"}>{(queryResults ?? []).length} results</Typography>}
        actions={<BasicExportAction
            data={queryResults}
            properties={properties}
            propertiesOrder={propertiesOrder ?? undefined}
        />}
        enablePopupIcon={false}
        sortable={false}
        tableController={{
            data: queryResults,
            dataLoading: false,
            noMoreToLoad: true
        }}
        displayedColumnIds={displayedColumnIds}
        properties={properties}/>;
}
