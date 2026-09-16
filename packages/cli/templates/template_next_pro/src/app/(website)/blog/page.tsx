import React from "react";
import { getBlogEntries } from "@/app/common/database";
import { BlogListView } from "@/app/(website)/components/BlogListView";

// Re-rendered at most once a minute, so content edited in the CMS appears on the
// website. Without this the page is built once and never changes in production.
export const revalidate = 60;

export default async function Page() {
    const blogEntries = await getBlogEntries({
        limit: 10,
    });

    return <BlogListView initialEntries={blogEntries}/>;
}
