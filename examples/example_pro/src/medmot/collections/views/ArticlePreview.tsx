import React, { useEffect, useState } from "react";
import { Container, Markdown, Typography } from "@firecms/ui";
import { EntityCustomViewParams, ErrorView, useStorageSource } from "@firecms/core";
import { Article } from "../articles_collection";

/**
 * This is a sample view used to render the content of a blog entry.
 * It is bound to the data that is modified in the form.
 * @constructor
 */
export function ArticlePreview({ modifiedValues }: EntityCustomViewParams<Article>) {

    const storage = useStorageSource();

    const [headerUrl, setHeaderUrl] = useState<string | undefined>();
    useEffect(() => {
        if (modifiedValues?.header_image) {
            storage.getDownloadURL(modifiedValues.header_image)
                .then((res) => res.url ? setHeaderUrl(res.url) : null);
        }
    }, [storage, modifiedValues?.header_image]);

    return (
        <div>

            {headerUrl && <img
                alt={"Header"}
                style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover"
                }}
                src={headerUrl}
            />}

            <div className="max-w-md flex flex-col items-center justify-center">
                {modifiedValues?.name && <Typography variant={"h3"} className="mt-10 mb-5">
                    {modifiedValues.name}
                </Typography>}

                {modifiedValues?.content && modifiedValues.content
                    .filter((e: any) => !!e)
                    .map(
                        (entry: any, index: number) => {
                            if (entry.type === "text")
                                return <Text key={`preview_text_${index}`}
                                             markdownText={entry.value}/>;
                            if (entry.type === "images")
                                return <Images key={`preview_images_${index}`}
                                               storagePaths={entry.value}/>;
                            return <ErrorView key={`preview_images_${index}`}
                                              error={"Unexpected value in blog entry"}/>
                        }
                    )}

            </div>

        </div>
    );

}

export function Images({ storagePaths }: { storagePaths: string[] }) {
    if (!storagePaths)
        return <></>;
    return <div className="flex">
        {storagePaths.map((path, index) =>
            <div className="p-8 m-4 w-[250px] h-[250px]"
                 key={`images_${index}`}>
                <StorageImage storagePath={path}/>
            </div>
        )}
    </div>;
}

export function StorageImage({ storagePath }: { storagePath: string }) {

    const storage = useStorageSource();
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (storagePath) {
            storage.getDownloadURL(storagePath)
                .then((res) => res.url ? setUrl(res.url) : null);
        }
    }, [storage, storagePath]);

    if (!storagePath)
        return <></>;

    return (<img
        alt={"Generic"}
        style={{
            objectFit: "contain",
            width: "100%",
            height: "100%"
        }} src={url}/>);
}

function Text({ markdownText }: { markdownText: string }) {

    if (!markdownText)
        return <></>;

    return <Container maxWidth={"sm"}>
        <div className="mt-24 mb-24">
            <Markdown source={markdownText}/>
        </div>
    </Container>;
}


