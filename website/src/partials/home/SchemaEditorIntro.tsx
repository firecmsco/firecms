import React from "react"

// @ts-ignore
import collectionEditorVideo from "@site/static/img/collection_editor_preview.mp4";
import { ContainerMixin, ContainerPaddingMixin, CTACaret, CTAOutlinedButtonMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export const SchemaEditorIntro = () => {

    return (
        <section
            className="relative">
            <div
                className={clsx("px-4 sm:px-6 mb-16 bg-light bg-gray-800 text-white dark:text-white",
                    "border-0 border-y",
                    defaultBorderMixin,)}>
                <div
                    className={clsx(
                        ContainerMixin,
                        ContainerPaddingMixin,
                        defaultBorderMixin,
                        "border-x border-y-0 ",
                        " flex flex-col py-20")}>

                    <h2 className="h1 mb-4 uppercase">
                        The best data schema editor
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

                    </div>


                    <div className={"my-8 pb-16"}>
                        <a
                            className={CTAOutlinedButtonMixin}
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
                    className={"rounded-xl"}
                    width="100%" loop autoPlay muted>
                    <source src={collectionEditorVideo} type="video/mp4"/>
                </video>
            </div>
        </section>
    )
}
