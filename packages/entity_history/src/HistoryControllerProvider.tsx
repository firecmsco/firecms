import React, { PropsWithChildren, useContext } from "react";
import equal from "react-fast-compare"

import { User } from "@firecms/core";

export type HistoryConfigController = {
    /**
     * Function to get a user by uid.
     * @param uid
     */
    getUser?: (uid: string) => User | null;
}

export const HistoryControllerContext = React.createContext<HistoryConfigController>({} as any);
export const useHistoryController = (): HistoryConfigController => useContext(HistoryControllerContext);


export interface HistoryControllerProviderProps {

    getUser?: (uid: string) => User | null;

}

export const HistoryControllerProvider = React.memo(
    function HistoryControllerProvider({
                                           children,
                                           getUser,
                                       }: PropsWithChildren<HistoryControllerProviderProps>) {

        return (
            <HistoryControllerContext.Provider
                value={{
                    getUser,
                }}>

                {children}

            </HistoryControllerContext.Provider>
        );
    }, equal);
