import {
    EntityCollection,
    EntityCollectionView,
    EntityCollectionViewProps,
} from "@camberi/firecms";
import { IconButton, Tooltip } from "@mui/material";
import { Settings } from "@mui/icons-material";

import {
    useCollectionEditorController
} from "../useCollectionEditorController";

export function SassEntityCollectionView<M extends { [Key: string]: unknown }>({
                                                                                   fullPath,
                                                                                   ...collection
                                                                               }: EntityCollectionViewProps<M>) {

    const collectionEditorController = useCollectionEditorController();
    const canEditCollection = collectionEditorController.configPermissions.editCollections;

    const usedCollection:EntityCollection<M> = { ...collection };

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


    return <EntityCollectionView fullPath={fullPath}
                                           {...usedCollection}/>

}
