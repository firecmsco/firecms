/**
 * Controller to open the side dialog displaying entity forms
 * @category Hooks and utilities
 */
export interface CollectionEditorController {

    editedCollectionPath?: string;
    editCollection: (path?: string) => void;

    newCollectionDialog?: {
        open: boolean,
        group?: string
    };
    openNewCollectionDialog: (props: {
        group?: string
    }) => void;
    closeNewCollectionDialog: () => void;

    collectionEditorViews: React.ReactNode;
}
