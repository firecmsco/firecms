import React, { useCallback, useState } from "react";
import { BreadcrumbEntry, BreadcrumbsController } from "../hooks/useBreadcrumbsController";

const DEFAULT_BREADCRUMBS_CONTROLLER: BreadcrumbsController = {
    breadcrumbs: [],
    set: () => {
    },
    updateCount: () => {
    }
};

export const BreadcrumbContext = React.createContext<BreadcrumbsController>(DEFAULT_BREADCRUMBS_CONTROLLER);

interface BreadcrumbsProviderProps {
    children: React.ReactNode;
}

export const BreadcrumbsProvider: React.FC<BreadcrumbsProviderProps> = ({ children }) => {

    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([]);

    const set = useCallback((props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => {
        setBreadcrumbs(props.breadcrumbs);
    }, []);

    const updateCount = useCallback((id: string, count: number | null | undefined) => {
        setBreadcrumbs(prev => prev.map(entry =>
            entry.id === id ? { ...entry, count } : entry
        ));
    }, []);

    return (
        <BreadcrumbContext.Provider
            value={{
                breadcrumbs,
                set,
                updateCount
            }}
        >
            {children}
        </BreadcrumbContext.Provider>
    );
};
