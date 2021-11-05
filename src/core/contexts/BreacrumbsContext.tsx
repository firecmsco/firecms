import React, { useState } from "react";
import {
    BreadcrumbEntry,
    BreadcrumbsController
} from "../../hooks/useBreadcrumbsContext";

const DEFAULT_BREADCRUMBS_CONTROLLER = {
    breadcrumbs: [],
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => {
    }
};


export const BreadcrumbContext = React.createContext<BreadcrumbsController>(DEFAULT_BREADCRUMBS_CONTROLLER);


interface BreadcrumbsProviderProps {
    children: React.ReactNode;
}

export const BreadcrumbsProvider: React.FC<BreadcrumbsProviderProps> = ({ children }) => {

    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([]);

    const set = (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => {
        setBreadcrumbs(props.breadcrumbs);
    };

    return (
        <BreadcrumbContext.Provider
            value={{
                breadcrumbs,
                set
            }}
        >
            {children}
        </BreadcrumbContext.Provider>
    );
};
