import { BlogEntry, BlogEntryWithId } from "@/app/common/types";
import { convertBlogEntry } from "@/app/common/database";
import React, { useEffect } from "react";
import { BlogEntryView } from "@/app/common/components/BlogEntryView";
import { CircularProgress } from "@firecms/ui";

export function CMSBlogPreview({ blogEntry, id }: {
    blogEntry?: BlogEntry,
    id: string
}) {

    const [convertedBlogEntry, setConvertedBlogEntry] = React.useState<BlogEntryWithId | null>(null);
    useEffect(() => {
        if (blogEntry)
            convertBlogEntry(blogEntry, id).then(setConvertedBlogEntry);
    }, [blogEntry, id]);

    if (!convertedBlogEntry) {
        return <CircularProgress/>;
    }
    return <BlogEntryView blogEntry={convertedBlogEntry}/>;

}
