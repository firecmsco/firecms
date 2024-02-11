import { FireCMSPlugin } from "@firecms/core";
import { ProjectConfig } from "./useBuildProjectConfig";
import { TextSearchInfoDialog } from "../components/subscriptions/TextSearchInfoDialog";
import { FirestoreDelegate } from "@firecms/firebase";
import { CollectionsConfigController } from "@firecms/collection_editor";
import { FireCMSAppConfig } from "../types";

export function useSaasPlugin({ projectConfig, firestoreDelegate, collectionConfigController, appConfig }: {
    projectConfig: ProjectConfig;
    appConfig?: FireCMSAppConfig;
    firestoreDelegate: FirestoreDelegate
    collectionConfigController: CollectionsConfigController;
}): FireCMSPlugin {

    const hasOwnTextSearchImplementation = Boolean(appConfig?.textSearchControllerBuilder);
    return {
        name: "Saas plugin",
        collectionView: {
            showTextSearchBar: ({ context, path, collection }) => {
                if (collection.textSearchEnabled === false) {
                    return false;
                }
                return true;
            },
            onTextSearchClick: ({ context, path, collection, parentCollectionIds }) => {
                if (projectConfig.canUseLocalTextSearch && projectConfig.localTextSearchEnabled && collection.textSearchEnabled) {
                    return firestoreDelegate.initTextSearchController({ path, collection });
                } else {
                    if (parentCollectionIds === undefined) {
                        console.warn("Enabling text search: Parent collection ids are undefined")
                    } else {
                        context.dialogsController.open({
                            key: "text_search_info",
                            Component: (props) => <TextSearchInfoDialog {...props}
                                                                        hasOwnTextSearchImplementation={hasOwnTextSearchImplementation}
                                                                        collectionConfigController={collectionConfigController}
                                                                        parentCollectionIds={parentCollectionIds}
                                                                        path={path}
                                                                        collection={collection}/>
                        });
                    }
                }
                return Promise.resolve(false);
            }
        }
    }
}
