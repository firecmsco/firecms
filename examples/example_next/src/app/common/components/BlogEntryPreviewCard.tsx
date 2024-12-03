"use client";
import React from "react";
import Link from 'next/link'
import { BlogEntryWithId } from "@/app/common/types";

interface BlogEntryPreviewCardProps {
    blogEntry: BlogEntryWithId;
}


const BlogEntryPreviewCard: React.FC<BlogEntryPreviewCardProps> = ({ blogEntry }) => {
    return (
        <Link href={"/blog/" + blogEntry.id}
              className="relative h-72 bg-surface-700 block w-full rounded overflow-hidden shadow-lg hover:shadow-xl transition duration-300 hover:scale-[1.02] text-white">
            {blogEntry.header_image && (
                <img className="absolute h-full w-full object-cover"
                     src={blogEntry.header_image}
                     alt={blogEntry.name}/>

            )}

            <div
                className={"h-full relative flex flex-col justify-end bg-gradient-to-t from-black via-[#00000010] via-40% to-60% pb-2"}>
                <div className="px-6 py-4 typography-h5">{blogEntry.name}</div>
            </div>

        </Link>
    );
};

export default BlogEntryPreviewCard;
