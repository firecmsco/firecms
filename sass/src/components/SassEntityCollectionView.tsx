import {
    EntityCollection,
    EntityCollectionView,
    EntityCollectionViewProps,
    PermissionsBuilder,
} from "@camberi/firecms";
import { IconButton, Tooltip } from "@mui/material";
import { Settings } from "@mui/icons-material";

import {
    useCollectionEditorController
} from "../useCollectionEditorController";
import { useCallback } from "react";
import { resolvePermissions } from "../util/permissions";

export function SassEntityCollectionView<M extends { [Key: string]: unknown }>({
                                                                                   fullPath,
                                                                                   ...collection
                                                                               }: EntityCollectionViewProps<M>) {

    const collectionEditorController = useCollectionEditorController();
    const canEditCollection = collectionEditorController.configPermissions.editCollections;

    const usedCollection: EntityCollection<M> = { ...collection };

    if (canEditCollection) {
        usedCollection.extraActions = (props) =>
            <Tooltip title={"Edit collection"}>
                <IconButton
                    color={"primary"}
                    onClick={() => collectionEditorController?.editCollection(fullPath)}>
                    <Settings/>
                </IconButton>
            </Tooltip>;
    }

    const permissions: PermissionsBuilder<any> = useCallback(({
                                                                  pathSegments,
                                                                  user,
                                                                  collection,
                                                                  authController
                                                              }) => resolvePermissions(collection, authController, pathSegments), []);


    return <EntityCollectionView fullPath={fullPath}
                                 permissions={permissions}
                                 {...usedCollection}/>

}
