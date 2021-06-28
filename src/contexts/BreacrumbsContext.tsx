import React, { useContext, useState } from "react";
import { BreadcrumbEntry } from "../core/navigation";

const DEFAULT_NAVIGATION = {
    breadcrumbs: [],
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => {
    }
};

export type { BreadcrumbEntry };

/**
 * @category Hooks and utilities
 */
export type BreadcrumbsController = {
    breadcrumbs: BreadcrumbEntry[];
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => void;
};

export const BreadcrumbContext = React.createContext<BreadcrumbsController>(DEFAULT_NAVIGATION);

/**
 * Hook to retrieve the BreadcrumbContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `CMSApp` or a `CMSAppProvider`
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
