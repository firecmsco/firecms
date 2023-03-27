import React from "react"

import collectionEditorVideo
// @ts-ignore
    from "@site/static/img/collection_editor_preview.mp4";
import {
    ContainerMixin,
    CTAButtonMixin,
    CTACaret,
    CTAOutlinedButtonMixin, CTAOutlinedButtonWhiteMixin
} from "../utils";
import useBaseUrl from "@docusaurus/useBaseUrl";

export const FireCMSCloudIntro = () => {

    return (
        <section
            className="relative">
            <div
                className={"px-4 sm:px-6 mb-16 bg-pink-400 text-white pb-16"}>
                <div
                    className={ContainerMixin + " flex flex-col py-20"}>

                    <h2 className="h1 mb-4 text-gray-900 uppercase">
                        New No-code FireCMS
                    </h2>

                    <div className={"mt-4 mx-auto text-xl"}>
                        <p>
                            <b>FireCMS Cloud</b> is a hosted version of FireCMS
                            that allows you to create your own headless CMS
                            in minutes. It includes a new content schema
                            editor that allows you to create your own
                            content models and collections.
                        </p>
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

                        <div >
                            Note that you can always use the <a
                            href={useBaseUrl("docs")}>self-hosted version</a> of
                            FireCMS
                        </div>

                    </div>


                    <div className={"my-8"}>
                        <a
                            className={CTAOutlinedButtonWhiteMixin}
                            href="http://app.firecms.co"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Go to FireCMS Cloud
                            <CTACaret/>
                        </a>
                    </div>
                </div>
            </div>
            <div
                className={ContainerMixin + " px-4 sm:px-6 -translate-y-44"}>
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
