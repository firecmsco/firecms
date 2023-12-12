import {
    CMSType,
    DataSource,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    ResolvedProperty,
    SaveEntityProps,
    useFirestoreDataSource
} from "firecms";
import { FirebaseApp } from "firebase/app";

type CustomDataSourceProps = { firebaseApp?: FirebaseApp };

/**
 * This is an example of a custom data source.
 * It is a React Hook that returns a {@link DataSource} object.
 * @param firebaseApp
 */
export function useCustomDatasource({ firebaseApp }: CustomDataSourceProps): DataSource {

    const firestoreDataSource = useFirestoreDataSource({
        firebaseApp
    });

    return {
        fetchCollection<M extends {
            [Key: string]: CMSType
        }>(props: FetchCollectionProps<M>): Promise<Entity<M>[]> {
            if (props.path === "your_path_custom") {
                // make your custom http call and return your Entities
            }
            return firestoreDataSource.fetchCollection(props);
        },
        fetchEntity<M extends {
            [Key: string]: CMSType
        }>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
            if (props.path === "your_path_custom") {
                // make your custom http call and return your Entities
            }
            return firestoreDataSource.fetchEntity(props);
        },
        saveEntity<M extends {
            [Key: string]: CMSType
        }>(props: SaveEntityProps<M>): Promise<Entity<M>> {
            if (props.path === "your_path_custom") {
                // make your custom http call and return your Entities
            }
            return firestoreDataSource.saveEntity(props);
        },
        deleteEntity<M extends {
            [Key: string]: CMSType
        }>(props: DeleteEntityProps<M>): Promise<void> {
            return firestoreDataSource.deleteEntity(props);
        },
        checkUniqueField(path: string, name: string, value: any, property: ResolvedProperty, entityId?: string): Promise<boolean> {
            return firestoreDataSource.checkUniqueField(path, name, value, property, entityId);
        },
        generateEntityId(path: string) {
            return firestoreDataSource.generateEntityId(path);
        },
        countEntities(path: {
            path: string,
            collection: EntityCollection,
        }): Promise<number> {
            return firestoreDataSource.countEntities(path);
        }
    }
}
