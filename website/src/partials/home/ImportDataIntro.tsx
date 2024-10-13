import React from "react"

// @ts-ignore
import dataImportVideo from "@site/static/img/import.mp4";
import { ContainerMixin, ContainerPaddingMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export const ImportDataIntro = () => {

    return (
        <section
            className="relative bg-white">

            <div
                className={clsx("px-4 sm:px-6  bg-light bg-gray-800 text-white dark:text-white",
                    "border-0 border-y",
                    defaultBorderMixin,)}>
                <div
                    className={clsx(
                        ContainerMixin,
                        ContainerPaddingMixin,
                        defaultBorderMixin,
                        "border-x border-y-0 ",
                        " flex flex-col py-20" )}>

                    <div className={"relative max-w-6xl mx-auto pb-16 mb-16"}>
                        <h2 className="h2 mb-4 uppercase font-mono">
                            Simple <b>Data Import</b>, from file to CMS
                        </h2>

                        <div className={"mt-4 mx-auto text-xl"}>
                            <p>
                                FireCMS offers a streamlined data import feature designed to make your life easier.
                                Whether you're working with extensive <b>CSV, JSON or Excel</b> files,
                                our intuitive tools enable you to transfer and integrate your datasets
                                into
                                FireCMS. No more tedious manual data entry or convoluted import processes—just
                                quick,
                                efficient, and reliable data importation.
                            </p>
                            <p>
                                Our data import tool will <b>detect your data types automatically</b>, and if you
                                override a mapping, it will do the data conversion for you.
                            </p>

                        </div>


                        {/*<div className={"my-8 pb-16"}>*/}
                        {/*    <a*/}
                        {/*        className={CTAOutlinedButtonMixin}*/}
                        {/*        href="http://app.firecms.co"*/}
                        {/*        rel="noopener noreferrer"*/}
                        {/*        target="_blank"*/}
                        {/*    >*/}
                        {/*        Go to FireCMS Cloud*/}
                        {/*        <CTACaret/>*/}
                        {/*    </a>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>

            <div
                className={ContainerMixin + " border-0 border-x " + defaultBorderMixin}>
                <div
                    className={ContainerMixin + " px-4 sm:px-6 -translate-y-44 "}>
                    <video
                        style={{
                            pointerEvents: "none",
                        }}
                        className={"rounded-xl"}
                        width="100%" loop autoPlay muted>
                        <source src={dataImportVideo} type="video/mp4"/>
                    </video>
                </div>

            </div>

        </section>
    )
}
