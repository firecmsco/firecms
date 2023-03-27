import React from "react";
import HeroButtons from "./HeroButtons";
// @ts-ignore
import FireCMSLogo from "@site/static/img/firecms_logo.svg";
import { ContainerMixin } from "../utils";

function OpenSourceDetails() {
    return (
        <section className="relative">

            <div className={ContainerMixin + " px-4 sm:px-6 mb-16"}>
                <div className="py-12 md:py-20">
                    <div
                        className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
                        <h2 className="h2 mb-4"
                            data-aos="zoom-y-out">
                            All the power of Firebase and open source
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-200"
                           data-aos="zoom-y-out">
                            Extend the functionality of your admin panel and
                            your complete project with all the capabilities of
                            Firebase and Google Cloud.
                        </p>
                        <p className="text-gray-600 dark:text-gray-200">
                            Firebase is a powerful backend as a service that
                            allows you to build apps without having to worry
                            about the infrastructure.
                            Use the built-in authentication, storage, hosting,
                            functions, and more.
                        </p>
                    </div>

                    <HeroButtons/>

                </div>
            </div>
        </section>
    );
}

export default OpenSourceDetails;
