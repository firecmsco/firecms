import { useContext } from "react";
import { BreadcrumbContext } from "../core/contexts/BreacrumbsContext";


/**
 * @category Hooks and utilities
 */
export interface BreadcrumbsController {
    breadcrumbs: BreadcrumbEntry[];
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => void;
}

/**
 * @category Hooks and utilities
 */
export interface BreadcrumbEntry {
    title: string;
    url: string;
}

/**
 * Hook to retrieve the BreadcrumbContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see BreadcrumbsController
 * @category Hooks and utilities
 */
export const useBreadcrumbsContext = (): BreadcrumbsController => useContext(BreadcrumbContext);
