import { useSideDialogsController } from "./useSideDialogsController";
import { EntitySelectionProps, EntitySelectionTable } from "../components";
import { useCallback } from "react";
import { useCollectionRegistryController } from "./navigation/contexts";

/**
 * This hook is used to open a side dialog that allows the selection
 * of entities under a given path.
 * You can use it in custom views for selecting entities.
 * You need to specify the path of the target collection at least.
 * If your collection is not defined in your  top collection configuration
 * (in your `FireCMS` component), you need to specify explicitly.
 * This is the same hook used internally when a reference property is defined.
 * @group Hooks and utilities
 */
export function useEntitySelectionDialog<M extends Record<string, any>>(referenceDialogProps: Omit<EntitySelectionProps<M>, "path"> & {
    path?: string | false;
    onClose?: () => void;
}): { open: () => void; close: () => void } {

    const navigation = useCollectionRegistryController();
    const sideDialogsController = useSideDialogsController();

    const open = useCallback(() => {
        if (referenceDialogProps.path) {
            let usedCollection = referenceDialogProps.collection;
            if (!usedCollection)
                usedCollection = navigation.getCollection(referenceDialogProps.path);
            if (!usedCollection)
                throw Error("Not able to resolve the collection in useEntitySelectionDialog. Make sure a collection is registered in path " + referenceDialogProps.path);
            sideDialogsController.open({
                key: `reference_${referenceDialogProps.path}`,
                component:
                    <EntitySelectionTable
                        collection={usedCollection}
                        {...referenceDialogProps as EntitySelectionProps<M>}/>,
                width: "90vw",
                onClose: () => {
                    referenceDialogProps.onClose?.();
                }
            });
        } else {
            throw Error("useReferenceDialog: You are trying to open a reference dialog, but have not declared the `path`")
        }
    }, [navigation, referenceDialogProps, sideDialogsController]);

    const close = useCallback(() => {
        sideDialogsController.close();
    }, [sideDialogsController]);

    return {
        open,
        close
    }

}
