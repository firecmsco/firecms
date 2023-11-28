import { AddIcon, Chip, Collapse, Typography, unslugify, useAuthController, useNavigationContext } from "@firecms/core";
import { useCollectionEditorController } from "../useCollectionEditorController";
import React from "react";

export function RootCollectionSuggestions() {

    const authController = useAuthController();
    const navigationContext = useNavigationContext();

    const collectionEditorController = useCollectionEditorController();
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user
        }).createCollections
        : true;

    const rootPathSuggestions = collectionEditorController.rootPathSuggestions ?? [];

    const showSuggestions = rootPathSuggestions.length > 3 || (navigationContext.collections.length === 0 && rootPathSuggestions.length > 0);
    return <Collapse
        in={showSuggestions}>

        <div
            className={"flex flex-col gap-1 p-2"}>

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
                                        parentPathSegments: [],
                                        redirect: true
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
