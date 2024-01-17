import { FireCMSPlugin } from "@firecms/core";
import { ProjectConfig } from "./useBuildProjectConfig";
import { TextSearchInfoDialog } from "../components/subscriptions/TextSearchInfoDialog";
import { FirestoreDelegate } from "@firecms/firebase";
import { CollectionsConfigController } from "@firecms/collection_editor";

export function useSaasPlugin({ projectConfig, firestoreDelegate, collectionConfigController }: {
    projectConfig: ProjectConfig;
    firestoreDelegate: FirestoreDelegate
    collectionConfigController: CollectionsConfigController;
}): FireCMSPlugin {
    return {
        name: "Saas plugin",
        collectionView: {
            showTextSearchBar: ({ context, path, collection }) => {
                if (collection.textSearchEnabled === false) {
                    return false;
                }
                return true;
            },
            onTextSearchClick: ({ context, path, collection }) => {
                if (projectConfig.canUseLocalTextSearch && projectConfig.localTextSearchEnabled && collection.textSearchEnabled) {
                    return firestoreDelegate.initTextSearchController({ path, collection });
                } else {
                    context.dialogsController.open({
                        key: "text_search_info",
                        Component: (props) => <TextSearchInfoDialog {...props}
                                                                    collectionConfigController={collectionConfigController}
                                                                    path={path}
                                                                    collection={collection}/>
                    });
                }
                return Promise.resolve(false);
            }
        }
    }
}
