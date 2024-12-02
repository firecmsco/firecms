import React from "react";
import { getBlogEntries } from "@/app/common/database";
import { BlogListView } from "@/app/(website)/components/BlogListView";

export default async function Page() {
    const blogEntries = await getBlogEntries({
        limit: 10,
    });

    console.log("Blog entries", blogEntries);

    return <BlogListView initialEntries={blogEntries}/>;
}
