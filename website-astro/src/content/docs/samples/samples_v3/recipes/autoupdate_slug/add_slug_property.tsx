import { buildCollection } from "@firecms/core";

export type Page = {
    title: string;
    slug: string;
}

export const pagesCollection = buildCollection<Page>({
    name: "Pages",
    slug: "pages",
    dbPath: "pages",
    properties: {
        title: {
            name: "Title",
            validation: { required: true },
            dataType: "string"
        },
        slug: {
            name: "Slug",
            dataType: "string",
            readOnly: true,
        }
    }
});
