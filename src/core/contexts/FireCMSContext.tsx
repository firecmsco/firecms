import React from "react";
import { FireCMSContext } from "../../models";


export const FireCMSContextInstance = React.createContext<FireCMSContext>({
    sideEntityController: {} as any,
    navigationContext: {} as any,
    schemaRegistryController: {} as any,
    dataSource: {} as any,
    storageSource: {} as any,
    authController: {} as any
});


/**
 *
 * @category Core
 */
export const FireCMSContextProvider: React.FC<React.PropsWithChildren<FireCMSContext>> = ({
                                                                                              children,
                                                                                              ...context
                                                                                          }) => {

    return (
        <FireCMSContextInstance.Provider
            value={context}
        >
            {children}
        </FireCMSContextInstance.Provider>
    );
};
