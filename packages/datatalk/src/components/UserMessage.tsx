import { Avatar, PersonIcon } from "@firecms/ui";
import React, { useEffect, useRef } from "react";

export function UserMessage({ text }: { text: string }) {

    const ref = useRef<HTMLDivElement>(null);
    const scrolled = useRef(false);
    useEffect(() => {
        if (scrolled.current) return;
        setTimeout(() => {
            ref.current?.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }, 100);
        scrolled.current = true;
    }, []);

    return <div ref={ref} className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3 justify-center">
            <Avatar className="w-10 h-10 shrink-0">
                <PersonIcon/>
            </Avatar>
            <div className="mt-3 flex-1 text-gray-700 dark:text-gray-300">
                {text.split("\n").map((line, index) => <p key={index}>{line}</p>)}
            </div>
        </div>
    </div>;
}
