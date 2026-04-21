# Add a slug to your documents

When building a CMS, it is common to want to generate slugs for your documents
based on a specific field, such as the title. This is useful for creating
SEO-friendly URLs and improving the discoverability of your content.

In this tutorial, we will show you how to automatically generate slugs for your
documents using FireCMS. It is very straightforward to add a callback that will
be executed before saving your document, allowing you to generate the slug based
on the title field.

### Declare your collection

For illustrative purposes, let's create two simple `pages` collection, with just a title field, that we will
be adding a slug to:

```tsx
import { buildCollection } from "@firecms/core";

export type Page = {
    title: string;
    slug: string;
}

export const pagesCollection = buildCollection<Page>({
    name: "Pages",
    id: "pages",
    path: "pages",
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

```

### Add the pre-save callback

To add a slug to your documents, you can use the `onPreSave` callback provided by FireCMS.
This callback will be executed before saving the document, allowing you to modify the document before
it is written to the database.

```tsx
import { EntityCallbacks, slugify } from "@firecms/core";

const callbacks: EntityCallbacks = {
    onPreSave: ({
                    collection,
                    path,
                    entityId,
                    values,
                    status,
                    context
                }) => {
        const updatedSlug = slugify(values.title);
        values.slug = updatedSlug;
        return values;
    }
};

```

### Complete code

Here is the complete code for this example:

```tsx
import { buildCollection, slugify } from "@firecms/core";

export type Page = {
    title: string;
    slug: string;
}

export const pagesCollection = buildCollection<Page>({
    name: "Pages",
    id: "pages",
    path: "pages",
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

```


