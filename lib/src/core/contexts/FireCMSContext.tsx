import React from "react";
import { FireCMSContext } from "../../types";

export const FireCMSContextInstance = React.createContext<FireCMSContext>({
    sideDialogsController: {} as any,
    sideEntityController: {} as any,
    navigation: {} as any,
    dataSource: {} as any,
    storageSource: {} as any,
    authController: {} as any,
    snackbarController: {} as any
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
