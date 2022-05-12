import React from "react";
import { ConfigController } from "./config_controller";

export const CollectionControllerContext = React.createContext<ConfigController>({} as any);


interface CollectionControllerProviderProps {
    children: React.ReactNode;
    collectionsController: ConfigController;
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
