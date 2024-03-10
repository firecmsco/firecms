import React from "react";
import { FireCMSPlugin, useAuthController, useNavigationController, User } from "@firecms/core";
import { ConfigControllerProvider } from "./ConfigControllerProvider";
import { CollectionEditorPermissionsBuilder } from "./types/config_permissions";
import { EditorCollectionAction } from "./ui/EditorCollectionAction";
import { HomePageEditorCollectionAction } from "./ui/HomePageEditorCollectionAction";
import { NewCollectionCard } from "./ui/NewCollectionCard";
import { PersistedCollection } from "./types/persisted_collection";
import { CollectionInference } from "./types/collection_inference";
import { CollectionsConfigController } from "./types/config_controller";
import { RootCollectionSuggestions } from "./ui/RootCollectionSuggestions";
import { CollectionViewHeaderAction } from "./ui/CollectionViewHeaderAction";
import { PropertyAddColumnComponent } from "./ui/PropertyAddColumnComponent";
import { NewCollectionButton } from "./ui/NewCollectionButton";
import { AddIcon, Button, Typography } from "@firecms/ui";
import { useCollectionEditorController } from "./useCollectionEditorController";

export interface CollectionConfigControllerProps<EC extends PersistedCollection = PersistedCollection, UserType extends User = User> {

    /**
     * Firebase app where the configuration is saved.
     */
    collectionConfigController: CollectionsConfigController;

    /**
     * Define what actions can be performed on the configuration.
     */
    configPermissions?: CollectionEditorPermissionsBuilder<UserType, EC>;

    /**
     * The words you define here will not be allowed to be used as group
     * names when creating collections.
     * e.g. ["admin"]
     */
    reservedGroups: string[];

    extraView?: {
        View: React.ComponentType<{
            path: string
        }>,
        icon: React.ReactNode
    };

    pathSuggestions?: (path: string) => Promise<string[]>;

    collectionInference?: CollectionInference;

    getData?: (path: string, parentPaths: string[]) => Promise<object[]>;

    getUser: (uid: string) => UserType | null;

    onAnalyticsEvent?: (event: string, params?: object) => void;

    introMode?: "new_project" | "existing_project";

}

/**
 * Use this hook to initialise the Collection Editor plugin.
 * This is likely the only hook you will need to use.
 * @param firebaseApp Firebase app where your project data lives.
 * @param configPermissions
 * @param reservedGroups
 * @param extraView
 * @param pathSuggestions
 * @param getUser
 * @param collectionInference
 */
export function useCollectionEditorPlugin<EC extends PersistedCollection = PersistedCollection, UserType extends User = User>
({
     collectionConfigController,
     introMode,
     configPermissions,
     reservedGroups,
     extraView,
     pathSuggestions,
     getUser,
     collectionInference,
     getData,
     onAnalyticsEvent
 }: CollectionConfigControllerProps<EC, UserType>): FireCMSPlugin<any, any, PersistedCollection> {

    return {
        name: "Collection Editor",
        loading: collectionConfigController.loading,
        provider: {
            Component: ConfigControllerProvider,
            props: {
                collectionConfigController,
                configPermissions,
                collectionInference,
                reservedGroups,
                extraView,
                pathSuggestions,
                getUser,
                getData,
                onAnalyticsEvent
            }
        },
        homePage: {
            additionalActions: <NewCollectionButton/>,
            additionalChildrenStart: introMode ? <IntroWidget introMode={introMode}/> : undefined,
            additionalChildrenEnd: <RootCollectionSuggestions introMode={introMode}/>,
            CollectionActions: HomePageEditorCollectionAction,
            AdditionalCards: introMode ? undefined : NewCollectionCard,
        },
        collectionView: {
            CollectionActions: EditorCollectionAction,
            HeaderAction: CollectionViewHeaderAction,
            AddColumnComponent: PropertyAddColumnComponent
        }
    };
}

export function IntroWidget({ introMode }: {
    introMode?: "new_project" | "existing_project";
}) {

    const navigation = useNavigationController();
    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    const authController = useAuthController();

    const collectionEditorController = useCollectionEditorController();
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
        }).createCollections
        : true;

    return (
        <div className={"mt-8 flex flex-col mt-8 p-2"}>
            <Typography variant={"h4"} className="mb-4">Welcome</Typography>
            <Typography paragraph={true}>Your admin panel is ready ✌️</Typography>
            <Typography paragraph={true}>
                Start building collections in FireCMS easily. Map them to your existing
                database data, import from files, or use our templates. Simplify your data management process
                now.
            </Typography>
            {canCreateCollections && <Button
                className={"mt-4"}
                onClick={collectionEditorController && canCreateCollections
                    ? () => collectionEditorController.createCollection({
                        parentCollectionIds: [],
                        redirect: true,
                        sourceClick: "new_collection_card"
                    })
                    : undefined}>
                <AddIcon/>Create your first collection
            </Button>}
        </div>
    );
}
