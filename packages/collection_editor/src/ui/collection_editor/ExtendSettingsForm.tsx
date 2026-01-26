import React from "react";
import {
    EntityCollection,
    User
} from "@firecms/core";
import {
    Button,
    cls,
    Container,
    defaultBorderMixin,
    Typography
} from "@firecms/ui";

import { useFormex } from "@firecms/formex";
import { CollectionsConfigController } from "../../types/config_controller";
import { CollectionInference } from "../../types/collection_inference";
import { SubcollectionsEditTab } from "./SubcollectionsEditTab";
import { EntityActionsEditTab } from "./EntityActionsEditTab";
import { PersistedCollection } from "../../types/persisted_collection";

export function ExtendSettingsForm({
    collection,
    parentCollection,
    configController,
    collectionInference,
    getUser,
    parentCollectionIds,
    isMergedCollection,
    onResetToCode
}: {
    collection: PersistedCollection;
    parentCollection?: EntityCollection;
    configController: CollectionsConfigController;
    collectionInference?: CollectionInference;
    getUser?: (uid: string) => User | null;
    parentCollectionIds?: string[];
    isMergedCollection?: boolean;
    onResetToCode?: () => void;
}) {

    const {
        values,
        setFieldValue,
        submitCount
    } = useFormex<EntityCollection>();

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-8 p-8 m-auto"}>

                <div>
                    <Typography variant={"h5"} className={"flex-grow"}>
                        Extend
                    </Typography>
                    <Typography variant={"body2"} color={"secondary"}>
                        Add subcollections, custom views, and entity actions to this collection.
                    </Typography>
                </div>

                {/* Subcollections Section */}
                <SubcollectionsEditTab
                    collection={collection}
                    parentCollection={parentCollection}
                    configController={configController}
                    collectionInference={collectionInference}
                    getUser={getUser}
                    parentCollectionIds={parentCollectionIds}
                    embedded={true}
                />

                {/* Entity Actions Section */}
                <EntityActionsEditTab collection={collection} embedded={true} />

                {/* Reset to code (for merged collections) */}
                {isMergedCollection && onResetToCode && (
                    <div className={cls("flex flex-col gap-4 mt-8 border-t pt-8", defaultBorderMixin)}>
                        <Typography variant={"body2"} color={"secondary"}>
                            This collection is defined in code.
                            The changes done in this editor will override the properties defined in code.
                            You can delete the overridden values to revert to the state defined in code.
                        </Typography>
                        <Button color={"neutral"} onClick={onResetToCode}>
                            Reset to code
                        </Button>
                    </div>
                )}

                <div style={{ height: "52px" }} />

            </Container>
        </div>
    );
}
