import React, { useContext, useState } from "react";
import { BreadcrumbEntry } from "./routes";

const DEFAULT_NAVIGATION = {
    breadcrumbs: [],
    currentTitle: undefined,
    pathParams: {},
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
        currentTitle: string;
        pathParams: {};
    }) => {
    }
};

export type BreadcrumbsStatus = {
    breadcrumbs: BreadcrumbEntry[];
    currentTitle?: string;
    pathParams: Record<string, string>
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
        currentTitle: string;
        pathParams: {};
    }) => void;
};

export const BreadcrumbContext = React.createContext<BreadcrumbsStatus>(DEFAULT_NAVIGATION);
export const useBreadcrumbsContext = () => useContext(BreadcrumbContext);

interface BreadcrumbsProviderProps {
    children: React.ReactNode;
}

export const BreadcrumbsProvider: React.FC<BreadcrumbsProviderProps> = ({ children }) => {

    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([]);
    const [currentTitle, setCurrentTitle] = useState<string | undefined>(undefined);
    const [pathParams, setPathParams] = useState<Record<string, string>>({});

    const set = (props: {
        breadcrumbs: BreadcrumbEntry[];
        currentTitle?: string;
        pathParams: {};
    }) => {
        setBreadcrumbs(props.breadcrumbs);
        setCurrentTitle(props.currentTitle);
        setPathParams(props.pathParams);
    };

    return (
        <BreadcrumbContext.Provider
            value={{
                breadcrumbs,
                currentTitle,
                pathParams,
                set
            }}
        >
            {children}
        </BreadcrumbContext.Provider>
    );
};
