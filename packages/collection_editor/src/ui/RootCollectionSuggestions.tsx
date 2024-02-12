import { unslugify, useAuthController, useNavigationController } from "@firecms/core";
import { AddIcon, Chip, Collapse, Typography, } from "@firecms/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";
import React from "react";

export function RootCollectionSuggestions() {

    const authController = useAuthController();
    const navigationController = useNavigationController();

    const collectionEditorController = useCollectionEditorController();
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user
        }).createCollections
        : true;

    const rootPathSuggestions = collectionEditorController.rootPathSuggestions ?? [];

    const showSuggestions = rootPathSuggestions.length > 3 || ((navigationController.collections ?? []).length === 0 && rootPathSuggestions.length > 0);
    return <Collapse
        in={showSuggestions}>

        <div
            className={"flex flex-col gap-1 p-2 my-4"}>

            <Typography variant={"body2"} color={"secondary"}>
                Create a collection from your data:
            </Typography>

            <div
                className={"flex flex-row gap-1 overflow-scroll no-scrollbar "}>
                {rootPathSuggestions.map((path) => {
                    return (
                        <div key={path}>
                            <Chip
                                icon={<AddIcon size={"small"}/>}
                                colorScheme={"cyanLighter"}
                                onClick={collectionEditorController && canCreateCollections
                                    ? () => collectionEditorController.createCollection({
                                        initialValues: { path, name: unslugify(path) },
                                        parentCollectionIds: [],
                                        redirect: true,
                                        sourceClick: "root_collection_suggestion"
                                    })
                                    : undefined}
                                size="small">
                                {path}
                            </Chip>
                        </div>
                    );
                })}
            </div>
        </div>
    </Collapse>
}
