import React from "react";

// @ts-ignore
import schemaEditorVideo from "@site/static/img/schema_editor.webm";
import { ContainerMixin, ContainerPaddingMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export const SchemaEditorShowcase = () => {
    return (
        <section className="relative bg-gray-900">
            <div
                className={clsx("px-4 sm:px-6 text-white dark:text-white",
                    "border-0 border-y bg-gray-950",
                    defaultBorderMixin)}>
                <div
                    className={clsx(
                        ContainerMixin,
                        ContainerPaddingMixin,
                        defaultBorderMixin,
                        "border-x border-y-0",
                        "flex flex-col py-20")}>

                    <div className={"relative max-w-6xl mx-auto pb-16 my-16"}>
                        <h3 className="mb-4 uppercase">
                            Automatic schema detection
                        </h3>

                        <div className={"mt-4 mx-auto text-xl"}>
                            <p>
                                Build your content model visually with FireCMS&#39;s powerful schema editor.
                                Create collections, define fields, and establish relationships with an
                                intuitive drag-and-drop UI.
                            </p>
                            <p>
                                With <b>20+ field types</b> and advanced validation options, you can build
                                sophisticated data models in minutes instead of hours. The schema editor
                                handles the complexity, letting you focus on <b>creating the perfect admin
                                experience</b> for your team.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={ContainerMixin + " border-0 border-x " + defaultBorderMixin}>
                <div
                    className={ContainerMixin + " px-4 sm:px-6 -translate-y-44"}>
                    <video
                        style={{
                            pointerEvents: "none",
                        }}
                        className={"rounded-xl border " + defaultBorderMixin}
                        width="100%" loop autoPlay muted playsInline>
                        <source src={schemaEditorVideo} type="video/mp4"/>
                    </video>
                </div>
            </div>

        </section>
    );
};
