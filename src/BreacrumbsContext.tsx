import React, { useContext, useState } from "react";
import { BreadcrumbEntry } from "./routes/navigation";

const DEFAULT_NAVIGATION = {
    breadcrumbs: [],
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => {
    }
};

export type BreadcrumbsStatus = {
    breadcrumbs: BreadcrumbEntry[];
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => void;
};

export const BreadcrumbContext = React.createContext<BreadcrumbsStatus>(DEFAULT_NAVIGATION);
export const useBreadcrumbsContext = () => useContext(BreadcrumbContext);

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
