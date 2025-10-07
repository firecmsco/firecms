import React from "react"

// @ts-ignore
import dataImportVideo from "@site/static/img/import.webm";
import { ContainerMixin, ContainerPaddingMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export const ImportDataIntro = () => {

    return (
        <section className="relative bg-white">

            <div
                className={clsx("px-4 sm:px-6 text-gray-800",
                    "border-0 border-y bg-gray-200",
                    defaultBorderMixin,)}>
                <div
                    className={clsx(
                        ContainerMixin,
                        ContainerPaddingMixin,
                        defaultBorderMixin,
                        "border-x border-y-0",
                        "flex flex-col py-20")}>

                    <div className={"relative max-w-6xl mx-auto pb-16 my-16"}>
                        <h3 className="mb-4 uppercase">
                            Simple <b>Data Import</b>, from file to CMS
                        </h3>

                        <div className={"mt-4 mx-auto text-xl"}>
                            <p>
                                FireCMS offers a streamlined data import feature designed to make your life easier.
                                Whether you&#39;re working with extensive <b>CSV, JSON or Excel</b> files,
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
                        width="100%" loop autoPlay muted>
                        <source src={dataImportVideo} type="video/mp4"/>
                    </video>
                </div>

            </div>

        </section>
    )
}
