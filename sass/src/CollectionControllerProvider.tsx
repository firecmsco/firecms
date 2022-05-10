import React from "react";
import { CollectionsController } from "./collections_controller";

export const CollectionControllerContext = React.createContext<CollectionsController>({} as any);


interface CollectionControllerProviderProps {
    children: React.ReactNode;
    collectionsController: CollectionsController;
}

export const CollectionControllerProvider: React.FC<CollectionControllerProviderProps> = ({
                                                                                              children,
                                                                                              collectionsController
                                                                                          }) => {

    return (
        <CollectionControllerContext.Provider
            value={collectionsController}
        >
            {children}

        </CollectionControllerContext.Provider>
    );
};
