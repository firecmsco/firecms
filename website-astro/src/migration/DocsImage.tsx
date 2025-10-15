import React, { useEffect, useState } from "react";

export function DocsImage({
                              src,
                              alt,
                              size
                          }: { src: string; alt?: string, size?: "small" | "medium" | "large" }) {
    const [imageSrc, setImageSrc] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(undefined);

    useEffect(() => {
        if (!src) return;
        // Reset states whenever 'src' changes
        setLoading(true);
        setError(undefined);

        import("@site/static/" + src)
            .then((module) => {
                // Assuming the image is the default export of the module
                setImageSrc(module.default);
            })
            .catch((err) => {
                setError(err);
                console.error("Failed to load image:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [src]); // Re-run this effect if 'src' changes

    if (loading) return null;
    if (error) return null;

    const widthClass = size === "small" ? "max-w-[600px]" : size === "medium" ? "max-w-[800px]" : "";
    return (
        <img
            loading="lazy"
            className={"ml-8 w-full rounded-lg my-4 " + widthClass}
            src={imageSrc}
            alt={alt ?? "Docs Image"}/>
    );
}
