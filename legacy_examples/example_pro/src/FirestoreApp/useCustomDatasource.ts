import {
    CMSType,
    DataSource,
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    FetchCollectionProps,
    FetchEntityProps,
    SaveEntityProps
} from "@firecms/core";
import { FirebaseApp } from "@firebase/app";
import { useFirestoreDelegate } from "@firecms/firebase";

type CustomDataSourceProps = {
    firebaseApp?: FirebaseApp,
};

/**
 * This is an example of a custom data source.
 * It is a React Hook that returns a {@link DataSource} object.
 * @param firebaseApp
 * @param navigationController
 */
export function useCustomDatasource({ firebaseApp }: CustomDataSourceProps): DataSourceDelegate {

    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
    })

    return {
        ...firestoreDelegate,
        fetchCollection<M extends {
            [Key: string]: CMSType
        }>(props: FetchCollectionProps<M>): Promise<Entity<M>[]> {
            if (props.path === "your_path_custom") {
                // make your custom http call and return your Entities
            }
            return firestoreDelegate.fetchCollection(props);
        },
        fetchEntity<M extends {
            [Key: string]: CMSType
        }>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
            if (props.path === "your_path_custom") {
                // make your custom http call and return your Entities
            }
            return firestoreDelegate.fetchEntity(props);
        },
        saveEntity<M extends {
            [Key: string]: CMSType
        }>(props: SaveEntityProps<M>): Promise<Entity<M>> {
            if (props.path === "your_path_custom") {
                // make your custom http call and return your Entities
            }
            return firestoreDelegate.saveEntity(props);
        },
        deleteEntity<M extends {
            [Key: string]: CMSType
        }>(props: DeleteEntityProps<M>): Promise<void> {
            return firestoreDelegate.deleteEntity(props);
        },
        checkUniqueField(path: string, name: string, value: any, entityId?: string): Promise<boolean> {
            return firestoreDelegate.checkUniqueField(path, name, value, entityId);
        },
        generateEntityId(path: string) {
            return firestoreDelegate.generateEntityId(path);
        },
        async countEntities(props: FetchCollectionProps): Promise<number> {
            return firestoreDelegate.countEntities?.(props) ?? 0;
        }
    }
}
