import { FireCMSPlugin, useNavigationController } from "@firecms/core";
import { FirestoreDelegate } from "@firecms/firebase";
import { CollectionsConfigController } from "@firecms/collection_editor";
import { Typography } from "@firecms/ui";
import { ProjectConfig } from "./useBuildProjectConfig";
import { TextSearchInfoDialog } from "../components/subscriptions/TextSearchInfoDialog";
import { FireCMSAppConfig } from "../types";
import { RootCollectionSuggestions } from "../components/RootCollectionSuggestions";
import { DataTalkSuggestions } from "../components/DataTalkSuggestions";

export function useSaasPlugin({
                                  projectConfig,
                                  firestoreDelegate,
                                  collectionConfigController,
                                  appConfig,
                                  dataTalkSuggestions,
                                  introMode
                              }: {
    projectConfig: ProjectConfig;
    appConfig?: FireCMSAppConfig;
    firestoreDelegate: FirestoreDelegate
    collectionConfigController: CollectionsConfigController;
    dataTalkSuggestions?: string[];
    introMode?: "new_project" | "existing_project";
}): FireCMSPlugin {

    const hasOwnTextSearchImplementation = Boolean(appConfig?.textSearchControllerBuilder);

    const additionalChildrenStart = <>
        {introMode ? <IntroWidget introMode={introMode}/> : undefined}
        {<DataTalkSuggestions suggestions={dataTalkSuggestions}/>}
    </>;

    return {
        key: "saas",
        homePage: {
            additionalChildrenStart,
            additionalChildrenEnd: <RootCollectionSuggestions introMode={introMode}/>,
        },
        collectionView: {
            showTextSearchBar: ({
                                    context,
                                    path,
                                    collection
                                }) => {
                if (collection.textSearchEnabled === false) {
                    return false;
                }
                return true;
            },
            onTextSearchClick: ({
                                    context,
                                    path,
                                    collection,
                                    parentCollectionIds
                                }) => {
                if (projectConfig.canUseLocalTextSearch && projectConfig.localTextSearchEnabled && collection.textSearchEnabled) {
                    return firestoreDelegate.initTextSearchController({
                        path,
                        collection
                    });
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

export function IntroWidget({ introMode }: {
    introMode?: "new_project" | "existing_project";
}) {

    const navigation = useNavigationController();
    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    return (
        <div className={"mt-8 flex flex-col p-2"}>
            <Typography variant={"h4"} className="mb-4">Welcome</Typography>
            <Typography paragraph={true}>Your admin panel is ready ✌️</Typography>
            <Typography paragraph={true}>
                FireCMS can be used as a standalone admin panel but it shines when you add your own custom
                functionality. Including your own custom components, fields, actions, views, and more.
            </Typography>
            <div>
                <Typography className={"inline"}>Get started with:</Typography>
                <div
                    className={"ml-2 select-all font-mono bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white p-2 px-3  border-gray-200 border-solid w-fit text-md font-bold inline-flex rounded-md"}>
                    yarn create firecms-app
                </div>
                <Typography className={"inline ml-2"}>More info in the <a
                    href={"https://firecms.co/docs/customization_quickstart"}
                    rel="noopener noreferrer"
                    target="_blank">docs</a></Typography>
            </div>
        </div>
    );
}
