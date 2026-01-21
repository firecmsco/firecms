import { useContext } from "react";
import { BreadcrumbContext } from "../contexts/BreacrumbsContext";

/**
 * @group Hooks and utilities
 */
export interface BreadcrumbsController {
    breadcrumbs: BreadcrumbEntry[];
    set: (props: {
        breadcrumbs: BreadcrumbEntry[];
    }) => void;
    /**
     * Update the count for a specific breadcrumb by ID.
     */
    updateCount: (id: string, count: number | null | undefined) => void;
}


/**
 * @group Hooks and utilities
 */
export interface BreadcrumbEntry {
    title: string;
    url: string;
    /**
     * Optional entity count for collection breadcrumbs.
     * - undefined: loading
     * - number: loaded count
     * - null: not applicable (e.g., entity breadcrumb)
     */
    count?: number | null;
    /**
     * Unique identifier for this breadcrumb (e.g., collection path).
     * Used to update count without replacing entire breadcrumb array.
     */
    id?: string;
}


/**
 * Hook to retrieve the BreadcrumbsController.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see BreadcrumbsController
 * @group Hooks and utilities
 */
export const useBreadcrumbsController = (): BreadcrumbsController => useContext(BreadcrumbContext);
