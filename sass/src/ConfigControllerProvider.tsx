import React from "react";
import { ConfigController } from "./models/config_controller";

export const ConfigControllerContext = React.createContext<ConfigController>({} as any);


interface ConfigControllerProviderProps {
    children: React.ReactNode;
    collectionsController: ConfigController;
}

export const ConfigControllerProvider: React.FC<ConfigControllerProviderProps> = ({
                                                                                              children,
                                                                                              collectionsController
                                                                                          }) => {

    return (
        <ConfigControllerContext.Provider
            value={collectionsController}
        >
            {children}

        </ConfigControllerContext.Provider>
    );
};
