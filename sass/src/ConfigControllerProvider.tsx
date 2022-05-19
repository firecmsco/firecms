import React from "react";
import { ConfigController } from "./models/config_controller";

export const ConfigControllerContext = React.createContext<ConfigController>({} as any);


interface ConfigControllerProviderProps {
    children: React.ReactNode;
    configController: ConfigController;
}

export const ConfigControllerProvider: React.FC<ConfigControllerProviderProps> = ({
                                                                                              children, configController
                                                                                          }) => {

    return (
        <ConfigControllerContext.Provider
            value={configController}
        >
            {children}

        </ConfigControllerContext.Provider>
    );
};
