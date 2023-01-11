import React, { useState } from "react"

import collectionEditorVideo
// @ts-ignore
    from "@site/static/img/collection_editor_preview.mp4";

export const FireCMSCloudIntro = () => {

    return (
        <section
            className="relative">
            <div
                className={"mx-auto px-4 sm:px-6 mb-16 bg-pink-400 text-white pb-16"}
                data-aos="fade-up"
                data-aos-delay="100">
                <div
                    className="relative flex flex-col items-center px-6 py-20">
                    <h2 className="h2 mb-8 text-gray-900">
                        Be the fist to try FireCMS Cloud
                    </h2>

                    <div
                        className="flex flex-col space-y-2 items-center mb-4 text-lg">
                        <div>
                            FireCMS Cloud is a hosted version of FireCMS that
                            allows you to create your own headless CMS in
                            minutes.
                        </div>
                        <div>
                            It is perfect either if you have an existing Firestore
                            project or you want to start from scratch.
                        </div>
                    </div>

                </div>
            </div>
            <div
                className="px-8 sm:px-16 md:px-24 xl:px-4 max-w-6xl mx-auto -translate-y-36">
                <video
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
