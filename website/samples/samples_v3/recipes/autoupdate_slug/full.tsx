import { buildCollection, slugify } from "@firecms/core";

export type Page = {
    title: string;
    slug: string;
}

export const pagesCollection = buildCollection<Page>({
    name: "Pages",
    slug: "pages",
    dbPath: "pages",
    callbacks: {
        onPreSave: ({
                        values,
                    }) => {
            const updatedSlug = slugify(values.title);
            values.slug = updatedSlug;
            return values;
        }
    },
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


