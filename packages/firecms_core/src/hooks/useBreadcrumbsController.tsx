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
}

/**
 * @group Hooks and utilities
 */
export interface BreadcrumbEntry {
    title: string;
    url: string;
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
