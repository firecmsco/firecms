import { useFirestoreDataSource, DataSource,FetchCollectionProps, FetchEntityProps, Entity, SaveEntityProps, DeleteEntityProps, Property } from "@camberi/firecms";
import { FirebaseApp } from "firebase/app";

type CustomDataSourceProps = { firebaseApp?: FirebaseApp; };

export function useCustomDatasource({ firebaseApp }: CustomDataSourceProps):DataSource {
    const firestoreDataSource = useFirestoreDataSource({ firebaseApp });

    return {
        fetchCollection<M>(props: FetchCollectionProps<M>): Promise<Entity<M>[]>{
            if(props.path === "your_path_custom"){
                // make your custom http call and return your Entities
            }
            return firestoreDataSource.fetchCollection(props);
        },
        fetchEntity<M>(props: FetchEntityProps<M>): Promise<Entity<M>>{
            if(props.path === "your_path_custom"){
                // make your custom http call and return your Entities
            }
            return firestoreDataSource.fetchEntity(props);
        },
        saveEntity<M>(props: SaveEntityProps<M>): Promise<Entity<M>>{
            if(props.path === "your_path_custom"){
                // make your custom http call and return your Entities
            }
            return firestoreDataSource.saveEntity(props);
        },
        deleteEntity<M>(props: DeleteEntityProps<M>): Promise<void>{
            return firestoreDataSource.deleteEntity(props);
        },
        checkUniqueField(path: string, name: string, value: any, property: Property, entityId?: string): Promise<boolean>{
            return firestoreDataSource.checkUniqueField(path, name, value, property, entityId);
        }
    }
}
