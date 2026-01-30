import { useState, useCallback, useEffect } from "react";
import { useDataSource, useSnackbarController } from "@firecms/core";
import type { Data } from "@measured/puck";

export interface LandingPage {
    id: string;
    name: string;
    slug: string;
    puckData: Data;
    status: "draft" | "published";
    createdAt: Date;
    updatedAt: Date;
}

// Simple collection definition for landing pages
const landingPagesCollection = {
    id: "landing_pages",
    name: "Landing Pages",
    path: "landing_pages",
    properties: {}
};

export function useLandingPage(pageId?: string) {
    const dataSource = useDataSource();
    const snackbar = useSnackbarController();

    const [page, setPage] = useState<LandingPage | null>(null);
    const [pages, setPages] = useState<LandingPage[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load all pages for the selector
    const loadPages = useCallback(async () => {
        setLoading(true);
        try {
            const result = await dataSource.fetchCollection({
                path: "landing_pages",
                collection: landingPagesCollection as any
            });
            const loadedPages = result.map((entity) => ({
                id: entity.id,
                name: entity.values.name || "Untitled",
                slug: entity.values.slug || entity.id,
                puckData: entity.values.puckData || { content: [], root: {} },
                status: entity.values.status || "draft",
                createdAt: entity.values.createdAt?.toDate?.() || new Date(),
                updatedAt: entity.values.updatedAt?.toDate?.() || new Date()
            })) as LandingPage[];
            setPages(loadedPages);
        } catch (error) {
            console.error("Failed to load pages:", error);
        } finally {
            setLoading(false);
        }
    }, [dataSource]);

    // Load a specific page
    const loadPage = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const entity = await dataSource.fetchEntity({
                path: "landing_pages",
                entityId: id,
                collection: landingPagesCollection as any
            });
            if (entity) {
                const loadedPage: LandingPage = {
                    id: entity.id,
                    name: entity.values.name || "Untitled",
                    slug: entity.values.slug || entity.id,
                    puckData: entity.values.puckData || { content: [], root: {} },
                    status: entity.values.status || "draft",
                    createdAt: entity.values.createdAt?.toDate?.() || new Date(),
                    updatedAt: entity.values.updatedAt?.toDate?.() || new Date()
                };
                setPage(loadedPage);
                return loadedPage;
            }
        } catch (error) {
            console.error("Failed to load page:", error);
            snackbar.open({
                type: "error",
                message: "Failed to load page"
            });
        } finally {
            setLoading(false);
        }
        return null;
    }, [dataSource, snackbar]);

    // Save page data
    const savePage = useCallback(async (id: string | undefined, data: Partial<LandingPage>) => {
        setSaving(true);
        try {
            const now = new Date();
            const values = {
                name: data.name || "Untitled",
                slug: data.slug || id || `page-${Date.now()}`,
                puckData: data.puckData || { content: [], root: {} },
                status: data.status || "draft",
                updatedAt: now,
                ...(id ? {} : { createdAt: now })
            };

            const savedEntity = await dataSource.saveEntity({
                path: "landing_pages",
                entityId: id,
                values,
                collection: landingPagesCollection as any,
                status: id ? "existing" : "new"
            });

            const savedPage: LandingPage = {
                id: savedEntity.id,
                name: values.name,
                slug: values.slug,
                puckData: values.puckData,
                status: values.status,
                createdAt: values.createdAt || page?.createdAt || now,
                updatedAt: now
            };

            setPage(savedPage);
            snackbar.open({
                type: "success",
                message: "Page saved successfully"
            });

            // Refresh the pages list
            loadPages();

            return savedPage;
        } catch (error) {
            console.error("Failed to save page:", error);
            snackbar.open({
                type: "error",
                message: "Failed to save page"
            });
        } finally {
            setSaving(false);
        }
        return null;
    }, [dataSource, page, snackbar, loadPages]);

    // Create a new page
    const createPage = useCallback(async (name: string) => {
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        return savePage(undefined, {
            name,
            slug,
            puckData: { content: [], root: { props: { title: name } } },
            status: "draft"
        } as Partial<LandingPage>);
    }, [savePage]);

    // Delete a page
    const deletePage = useCallback(async (id: string) => {
        try {
            await dataSource.deleteEntity({
                entity: {
                    id,
                    path: "landing_pages",
                    values: {}
                } as any
            });
            snackbar.open({
                type: "success",
                message: "Page deleted"
            });
            loadPages();
            if (page?.id === id) {
                setPage(null);
            }
        } catch (error) {
            console.error("Failed to delete page:", error);
            snackbar.open({
                type: "error",
                message: "Failed to delete page"
            });
        }
    }, [dataSource, page, snackbar, loadPages]);

    // Load pages on mount
    useEffect(() => {
        loadPages();
    }, [loadPages]);

    // Load specific page when pageId changes
    useEffect(() => {
        if (pageId) {
            loadPage(pageId);
        } else {
            setPage(null);
        }
    }, [pageId, loadPage]);

    return {
        page,
        pages,
        loading,
        saving,
        loadPage,
        loadPages,
        savePage,
        createPage,
        deletePage,
        setPage
    };
}
