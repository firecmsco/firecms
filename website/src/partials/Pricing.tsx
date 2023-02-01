import React from "react";

// @ts-ignore
import featuresBg from "@site/static/img/features-bg.png";
// @ts-ignore
import featuresElement from "@site/static/img/features-element.png";

import useBaseUrl from "@docusaurus/useBaseUrl";

function Pricing() {

    const community = <div
        className="flex flex-col bg-white dark:bg-gray-900 m-4 sm:m-6 lg:m-10 lg:col-span-1 rounded-lg overflow-hidden border border-solid dark:border-gray-800 border-gray-200 ">
        <div
            className="p-4 bg-green-500 text-center ">
            <h3 className="h5 mb-0 text-white ">
                Community
            </h3>
        </div>
        <div className="my-8 mx-4 text-lg text-center">
            <p>
                FireCMS is totally <b>FREE</b>
            </p>
            <p>
                FireCMS is and open source MIT-licensed project, available for
                anyone to use, also commercially.
            </p>
            <p>
                If you find FireCMS is useful for your project, we would highly
                appreciate it if you would consider becoming a <a
                rel="noopener noreferrer"
                target="_blank"
                href={"https://github.com/sponsors/Camberi"}>sponsor</a>
                ❤️
            </p>
            <p>
                Also, you are welcome to join our <a href={"https://discord.gg/fxy7xsQm3m"}>Discord channel</a>
            </p>
        </div>

        <div className="flex flex-col m-8 justify-self-end">
            <a
                className={"btn mx-auto sm:mb-0  py-4 bg-black text-white  hover:text-white uppercase border border-solid w-full sm:w-auto rounded"}
                href={useBaseUrl("docs/")}
            >
                Get started
            </a>
        </div>
    </div>;


    const advanced = <div
        className="flex flex-col bg-white dark:bg-gray-900 m-4 sm:m-6 lg:m-10 lg:col-span-1 rounded-lg overflow-hidden border border-solid dark:border-gray-800 border-gray-200 ">
        <div
            className="p-4 bg-primary text-center ">
            <h3 className="h5 mb-0 text-white ">
                Advanced
            </h3>
        </div>
        <div className="my-8 mx-4 text-lg text-center">
            <p>
                Do you need help setting up your project?
            </p>
            <p>
                Or maybe you need to
                build some features that are not included in the library?
            </p>
            <p>
                No problem! We are here to help.
                We can build a super tailored admin panel for your project, with
                custom views, forms or even your own backend
            </p>
            <p>🙌</p>
        </div>

        <div className="flex flex-col m-8 justify-self-end">
            <a
                className={"btn mx-auto sm:mb-0  py-4 bg-black text-white  hover:text-white uppercase border border-solid w-full sm:w-auto rounded"}
                href="mailto:hello@firecms.co?subject=FireCMS%20consulting"
                rel="noopener noreferrer"
                target="_blank"
            >
                Get in touch
            </a>
        </div>
    </div>;


    return (
        <section
            className="relative mx-auto text-center py-12 md:py-20">

            <h2 className="h2 ">
                Pricing
            </h2>

            {/*<p className="text-xl text-gray-600 dark:text-gray-200 dark:text-gray-200">*/}
            {/*    This is the best part*/}
            {/*</p>*/}

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6">

                <div className="md:grid md:grid-cols-2 content-center"
                     data-aos="fade-up"
                     data-aos-delay="100"
                >

                    {community}

                    {advanced}

                </div>
            </div>
        </section>
    );
}


export default Pricing;
