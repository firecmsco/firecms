import {
    CMSType,
    DataSource,
    DeleteEntityProps,
    Entity,
    FetchCollectionProps,
    FetchEntityProps,
    NavigationController,
    SaveEntityProps,
    useBuildDataSource,
} from "@firecms/core";
import { FirebaseApp } from "firebase/app";
import { useFirestoreDelegate } from "@firecms/firebase_pro";

type CustomDataSourceProps = {
    firebaseApp?: FirebaseApp,
    navigationController: NavigationController
};

/**
 * This is an example of a custom data source.
 * It is a React Hook that returns a {@link DataSource} object.
 * @param firebaseApp
 * @param navigationController
 */
export function useCustomDatasource({ firebaseApp, navigationController }: CustomDataSourceProps): DataSource {

    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
    })

    const firestoreDataSource = useBuildDataSource({
        delegate: firestoreDelegate,
        navigationController
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
        checkUniqueField(path: string, name: string, value: any, entityId?: string): Promise<boolean> {
            return firestoreDataSource.checkUniqueField(path, name, value, entityId);
        },
        generateEntityId(path: string) {
            return firestoreDataSource.generateEntityId(path);
        },
        countEntities(props: FetchCollectionProps): Promise<number> {
            return firestoreDataSource.countEntities(props);
        }
    }
}
