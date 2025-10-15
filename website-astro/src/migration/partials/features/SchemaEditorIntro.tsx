import React from "react"

// @ts-ignore
const collectionEditorVideo = "/img/colection_editor.webm";
import { ContainerMixin, ContainerPaddingMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export const SchemaEditorIntro = () => {

    return (
        <section
            className="relative bg-gray-900">
            <div
                className={clsx("px-4 sm:px-6 mb-16 bg-gray-950 text-white dark:text-white",
                    "border-0 border-y",
                    defaultBorderMixin
                )}>
                <div
                    className={clsx(
                        ContainerMixin,
                        ContainerPaddingMixin,
                        defaultBorderMixin,
                        "border-x border-y-0 ",
                        " flex flex-col py-20")}>

                    <div className={"relative max-w-6xl mx-auto mt-16"}>
                        <h3 className="mb-4 uppercase">
                            Simple <b>Data Schema</b>, from file to CMS
                        </h3>

                        <div className={"mt-4 mx-auto text-xl pb-20"}>
                            <p>
                                Edit your data schema with a powerful and intuitive
                                interface.
                            </p>
                            <p>If you have an <strong>existing
                                project</strong>, let FireCMS
                                set-up the collections for you, based on your
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
            </div>

            <div className={ContainerMixin + " px-4 sm:px-6 -translate-y-44"}>
                <video
                    style={{
                        pointerEvents: "none",
                        aspectRatio: 1296 / 699
                    }}
                    className={"rounded-xl"}
                    width="100%" loop autoPlay muted>
                    <source src={collectionEditorVideo} type="video/mp4"/>
                </video>
            </div>
        </section>
    )
}
