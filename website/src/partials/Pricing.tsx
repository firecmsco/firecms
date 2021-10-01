import React from "react";

// @ts-ignore
import featuresBg from "@site/static/img/features-bg.png";
// @ts-ignore
import featuresElement from "@site/static/img/features-element.png";

// @ts-ignore
import ReactLogo from "@site/static/img/reactjs-icon.svg";
// @ts-ignore
import FireCMSLogo from "@site/static/img/firecms_logo.svg";
// @ts-ignore
import FirebaseLogo from "@site/static/img/firebase.svg";
// @ts-ignore
import pricePreview from "@site/static/img/price.png";
// @ts-ignore
import cmsPreviewVideo from "@site/static/img/editing.mp4";
// @ts-ignore
import customFieldVideo from "@site/static/img/custom_fields.mp4";

import useThemeContext from "@theme/hooks/useThemeContext";
import useBaseUrl from "@docusaurus/useBaseUrl";

function Pricing() {

    const { isDarkTheme } = useThemeContext();

    const community = <div
        className="bg-white dark:bg-opacity-5 m-4 md:m-10 lg:col-span-1 rounded-lg border-b-4 overflow-hidden shadow-lg hover:shadow-2xl transition duration-500 transform ">
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
            </p>
            <p>
                ❤️
            </p>
        </div>

        <div className="flex flex-col m-8">
            <a
                className={"btn mx-auto sm:mb-0 font-bold py-4 bg-black text-white font-bold hover:text-white uppercase border border-solid w-full sm:w-auto rounded"}
                href={useBaseUrl("docs/")}
            >
                Get started
            </a>
        </div>
    </div>;


    const advanced = <div
        className="bg-white dark:bg-opacity-5 m-4 md:m-10 lg:col-span-1 rounded-lg border-b-4 overflow-hidden shadow-lg hover:shadow-2xl transition duration-500 transform">
        <div
            className="p-4 bg-blue-600 text-center ">
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

        <div className="flex flex-col m-8">
            <a
                className={"btn mx-auto sm:mb-0 font-bold py-4 bg-black text-white font-bold hover:text-white uppercase border border-solid w-full sm:w-auto rounded"}
                href={"mailto: hello@camberi.com"}
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
