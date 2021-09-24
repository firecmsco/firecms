import React, { useContext, useState } from "react";

const DEFAULT_BREADCRUMBS_CONTROLLER = {
    breadcrumbs: [],
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => {
    }
};

/**
 * @category Hooks and utilities
 */
export interface BreadcrumbEntry {
    title: string;
    url: string;
}

/**
 * @category Hooks and utilities
 */
export interface BreadcrumbsController {
    breadcrumbs: BreadcrumbEntry[];
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => void;
}

export const BreadcrumbContext = React.createContext<BreadcrumbsController>(DEFAULT_BREADCRUMBS_CONTROLLER);

/**
 * Hook to retrieve the BreadcrumbContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `CMSAppProvider`
 *
 * @see BreadcrumbsController
 * @category Hooks and utilities
 */
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
