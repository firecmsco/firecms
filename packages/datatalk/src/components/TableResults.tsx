import { useEffect, useMemo, useState } from "react";
import { doc, DocumentReference, getFirestore, QuerySnapshot, setDoc } from "@firebase/firestore";
import {
    CollectionSize,
    copyEntityAction,
    deleteEntityAction,
    editEntityAction,
    Entity,
    EntityAction,
    EntityCollection,
    EntityCollectionRowActions,
    EntityCollectionTable,
    OnCellValueChange,
    PropertiesOrBuilders,
    resolveCollection,
    useCustomizationController,
    useNavigationController,
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

    const navigation = useNavigationController();
    const customizationController = useCustomizationController();

    async function inferProperties() {
        if (querySnapshot.docs.length === 0) {
            return;
        }
        const pathAndId = querySnapshot.docs[0].ref.path;
        const resultsPath = pathAndId.split("/").slice(0, -1).join("/");
        let foundProperties = null;
        let foundPropertiesOrder;

        const entities = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            path: doc.ref.path,
            values: firestoreToCMSModel(doc.data())
        }));

        setPath(resultsPath);

        if (resultsPath) {
            const collection = navigation.getCollection(resultsPath, true);
            setCollection(collection);
            if (collection) {
                // foundProperties = collection.properties;
                foundPropertiesOrder = collection.propertiesOrder;
            }
        }

        const docs = querySnapshot.docs.map((doc: any) => doc.data());
        foundProperties = await getPropertiesFromData(docs);

        foundPropertiesOrder = buildPropertiesOrder(foundProperties, foundPropertiesOrder, priorityKeys);

        setQueryResults(entities);
        setProperties(foundProperties);
        setPropertiesOrder(foundPropertiesOrder)
    }

    useEffect(() => {
        inferProperties();
    }, []);

    const [queryResults, setQueryResults] = useState<Entity<any>[] | null>(null);
    const [properties, setProperties] = useState<PropertiesOrBuilders | null>(null);
    const [propertiesOrder, setPropertiesOrder] = useState<string[] | null>(null);
    const [path, setPath] = useState<string | null>(null);
    const [collection, setCollection] = useState<EntityCollection | undefined>();

    const resolvedCollection = useMemo(() => {
        return collection && path ? resolveCollection<any>({
                collection,
                path,
                propertyConfigs: customizationController.propertyConfigs
            })
            : undefined;
    }, [collection, path]);

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
        const documentReference: DocumentReference = doc(firestore, entity.path);
        return setDoc(documentReference, firebaseValues, { merge: true })
            .then((res) => {
                onValueUpdated();
            })
            .catch((error) => {
                console.error("Error updating document", error);
                setError(error);
            });

    };

    if (!queryResults || !properties) return null;

    const getActionsForEntity = ({
                                     entity,
                                     customEntityActions
                                 }: {
        entity?: Entity<any>,
        customEntityActions?: EntityAction[]
    }): EntityAction[] => {
        const actions: EntityAction[] = [editEntityAction];
        actions.push(copyEntityAction);
        actions.push(deleteEntityAction);
        if (customEntityActions)
            actions.push(...customEntityActions);
        return actions;
    };

    const tableRowActionsBuilder = ({
                                        entity,
                                        size,
                                        width,
                                        frozen
                                    }: {
        entity: Entity<any>,
        size: CollectionSize,
        width: number,
        frozen?: boolean
    }) => {

        const actions = getActionsForEntity({
            entity,
            customEntityActions: resolvedCollection?.entityActions
        });

        const path = entity.path.split("/").slice(0, -1).join("/");
        return (
            <EntityCollectionRowActions
                entity={entity}
                width={width}
                frozen={frozen}
                selectionEnabled={false}
                size={size}
                collection={resolvedCollection ?? undefined}
                fullPath={path}
                actions={actions}
                hideId={resolvedCollection?.hideIdFromCollection}
            />
        );

    };

    return <EntityCollectionTable
        inlineEditing={true}
        defaultSize={"s"}
        selectionController={selectionController}
        onValueChange={onValueChange}
        filterable={false}
        actionsStart={<Typography
            variant={"caption"}>
            {(queryResults ?? []).length} results
        </Typography>}
        actions={<BasicExportAction
            data={queryResults}
            properties={properties}
            propertiesOrder={propertiesOrder ?? undefined}
        />}
        enablePopupIcon={false}
        sortable={false}
        tableRowActionsBuilder={tableRowActionsBuilder}
        tableController={{
            data: queryResults,
            dataLoading: false,
            noMoreToLoad: true
        }}
        displayedColumnIds={displayedColumnIds}
        properties={properties}/>;
}
