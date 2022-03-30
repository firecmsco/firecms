/**
 * Controller to open the side dialog displaying entity forms
 * @category Hooks and utilities
 */
export interface CollectionEditorController {

    editCollection: (path: string) => void;

    openNewCollectionDialog: (props: {
        group?: string
    }) => void;

    collectionEditorViews: React.ReactNode;
}
