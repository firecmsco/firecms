import React from "react"

import collectionEditorVideo
// @ts-ignore
    from "@site/static/img/collection_editor_preview.mp4";

export const FireCMSCloudIntro = () => {

    return (
        <section
            className="relative">
            <div
                className={"px-4 sm:px-6 mb-16 bg-pink-400 text-white pb-16"}>
                <div
                    className="max-w-6xl mx-auto relative flex flex-col py-20">
                    <h2 className="h1 mb-4 text-gray-900 uppercase">
                        New content-schema editor
                    </h2>

                    <div className={"mt-4 mx-auto text-xl"}>
                        <div>
                            FireCMS Cloud is a hosted version of FireCMS that
                            allows you to create your own headless CMS in
                            minutes. It includes a new content schema editor
                            that allows you to create your own content models
                            and collections.
                        </div>
                        <p>If you have an <strong>existing Firebase
                            project</strong>, let FireCMS Cloud
                            set-up the collections for you based on your
                            data <strong>automatically</strong>.</p>
                        <p>FireCMS is great both for existing projects, since it
                            will adapt
                            to any database structure you have, as well as for
                            new ones,
                            since it sets up a complete Google Cloud Project for
                            you.</p>
                    </div>

                </div>
            </div>
            <div
                className="px-4 sm:px-6  max-w-6xl mx-auto -translate-y-44">
                <video
                    style={{
                        aspectRatio: 2.415
                    }}
                    className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200"}
                    width="100%" loop autoPlay muted>
                    <source src={collectionEditorVideo} type="video/mp4"/>
                </video>
            </div>
        </section>
    )
}

function validateEmail(email: string) {
    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
}
