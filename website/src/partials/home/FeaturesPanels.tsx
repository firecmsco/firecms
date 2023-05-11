import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import { ContainerMixin, CTACaret, CTAOutlinedButtonMixin } from "../utils";
import { gridIcon, lightningIcon } from "../icons";

// @ts-ignore
import editingDemoVideo from "@site/static/img/editing_demo.mp4";
// @ts-ignore
import editingDemoDarkVideo from "@site/static/img/editing_demo_dark.mp4";

import { useColorMode } from "@docusaurus/theme-common";

function FeaturesPanels() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <section
            className={ContainerMixin + " px-4 relative sm:px-6 py-16 md:py-28"}>

            <div
                className="flex items-center max-w-xl md:max-w-none md:w-full mx-auto mb-4"
                data-aos="fade-right"
            >
                <div className="md:pr-4 lg:pr-12 xl:pr-16">

                    <div className={"flex items-center mb-4"}>

                        <div
                            className="flex items-center justify-center text-white w-10 h-10 bg-gray-800 rounded-full shadow flex-shrink-0 mr-4">
                            {lightningIcon}
                        </div>

                        <h2 className="h1 m-0">
                            Batteries included
                        </h2>

                    </div>

                    <p className="text-xl text-gray-600 dark:text-gray-200 text-xl md:text-2xl">
                        FireCMS provides all the flexibility you
                        need with the best UX.
                        Edit your collections and entities using
                        both a <b>spreadsheet
                        view</b> and <b>powerful forms</b>.
                    </p>
                </div>

            </div>

            {/*<div*/}
            {/*    className="max-w-xl md:max-w-none md:w-full mx-auto lg:col-span-5 mb-8 md:mb-0 md:order-1"*/}
            {/*    data-aos="fade-left"*/}
            {/*>*/}
            {/*    <div className="relative flex flex-col p-4">*/}
            {/*        <video*/}
            {/*            key={`demo_video_${isDarkTheme}`}*/}
            {/*            style={{*/}
            {/*                maxHeight: 589,*/}
            {/*                aspectRatio: 508 / 589*/}
            {/*            }}*/}
            {/*            className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200 border-gray-200"}*/}
            {/*            width="100%" loop autoPlay muted>*/}
            {/*            <source*/}
            {/*                src={isDarkTheme ? editingDemoDarkVideo : editingDemoVideo}*/}
            {/*                type="video/mp4"/>*/}
            {/*        </video>*/}

            {/*    </div>*/}
            {/*</div>*/}

            <div
                className="max-w-sm mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start md:max-w-2xl lg:max-w-none text-xl">
                <div
                    data-aos="fade-up"
                    data-aos-delay="100">
                    <div
                        className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded border border-solid dark:border-gray-800 border-gray-200">
                        {iconStars}
                        <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">
                            Consistent Data Management
                        </h4>
                        <p className="text-gray-600 dark:text-gray-200 text-center">
                            Establish schemas for your data types and set
                            validation options
                        </p>
                    </div>
                </div>

                <div
                    data-aos="fade-up"
                    data-aos-delay="150">
                    <div
                        className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded border border-solid dark:border-gray-800 border-gray-200">
                        {gridIcon}
                        <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">
                            Sophisticated Editing Tools
                        </h4>
                        <p className="text-gray-600 dark:text-gray-200 text-center">
                            Spreadsheet-style editing, robust forms,
                            file storage, entity references...
                        </p>
                    </div>
                </div>

                <div
                    data-aos="fade-up"
                    data-aos-delay="200">
                    <div
                        className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded border border-solid dark:border-gray-800 border-gray-200">
                        {iconDoor}
                        <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">
                            Role-Based System
                        </h4>
                        <p className="text-gray-600 dark:text-gray-200 text-center">
                            Configure app settings according to the logged-in
                            user
                        </p>
                    </div>

                </div>

                <div
                    data-aos="fade-up"
                    data-aos-delay="100">
                    <div
                        className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded border border-solid dark:border-gray-800 border-gray-200">
                        {iconCards}
                        <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">
                            Flexible Customization
                        </h4>
                        <p className="text-gray-600 dark:text-gray-200 text-center">
                            Incorporate custom form fields, hooks, and full views based on React
                        </p>
                    </div>
                </div>

                <div
                    data-aos="fade-up"
                    data-aos-delay="150">
                    <div
                        className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded border border-solid dark:border-gray-800 border-gray-200">
                        {iconArrows}
                        <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">
                            Subcollection Compatibility
                        </h4>
                        <p className="text-gray-600 dark:text-gray-200 text-center">
                            Seamless navigation for collections within other entities
                        </p>
                    </div>
                </div>
                <div
                    data-aos="fade-up"
                    data-aos-delay="200">
                    <div
                        className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded border border-solid dark:border-gray-800 border-gray-200">

                        {iconRadar}

                        <h4 className="text-xl font-bold leading-snug tracking-tight mb-1">
                            Real-Time Support
                        </h4>
                        <p className="text-gray-600 dark:text-gray-200 text-center">
                            Live updates in every view of your CMS, ideal for background updates
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="max-w-3xl mx-auto text-center py-8 md:py-12">
                <a
                    className={CTAOutlinedButtonMixin + " mx-auto"}
                    href={useBaseUrl("features/")}
                >
                    See all features
                    <CTACaret/>
                </a>
            </div>

        </section>
    );
}

export default FeaturesPanels;

const iconStars = <svg
    className="w-16 h-16 p-1 -mt-1 mb-2"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
>
    <g fill="none" fillRule="evenodd">
        <rect
            className="fill-current text-primary"
            width="64"
            height="64"
            rx="32"
        />
        <g strokeWidth="2">
            <path
                className="stroke-current text-white"
                d="M32 37.714A5.714 5.714 0 0037.714 32a5.714 5.714 0 005.715 5.714"
            />
            <path
                className="stroke-current text-white"
                d="M32 37.714a5.714 5.714 0 015.714 5.715 5.714 5.714 0 015.715-5.715M20.571 26.286a5.714 5.714 0 005.715-5.715A5.714 5.714 0 0032 26.286"
            />
            <path
                className="stroke-current text-white"
                d="M20.571 26.286A5.714 5.714 0 0126.286 32 5.714 5.714 0 0132 26.286"
            />
            <path
                className="stroke-current text-blue-300"
                d="M21.714 40h4.572M24 37.714v4.572M37.714 24h4.572M40 21.714v4.572"
                strokeLinecap="square"
            />
        </g>
    </g>
</svg>;

const iconTalking = <svg
    className="w-16 h-16 p-1 -mt-1 mb-2"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
>
    <g fill="none" fillRule="evenodd">
        <rect
            className="fill-current text-primary"
            width="64"
            height="64"
            rx="32"
        />
        <g strokeLinecap="square" strokeWidth="2">
            <path
                className="stroke-current text-blue-300"
                d="M38.826 22.504a9.128 9.128 0 00-13.291-.398M35.403 25.546a4.543 4.543 0 00-6.635-.207"
            />
            <path
                className="stroke-current text-white"
                d="M19.429 25.143A6.857 6.857 0 0126.286 32v1.189L28 37.143l-1.714.571V40A2.286 2.286 0 0124 42.286h-2.286v2.285M44.571 25.143A6.857 6.857 0 0037.714 32v1.189L36 37.143l1.714.571V40A2.286 2.286 0 0040 42.286h2.286v2.285"
            />
        </g>
    </g>
</svg>;

const iconDoor = <svg
    className="w-16 h-16 p-1 -mt-1 mb-2"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
>
    <g fill="none" fillRule="evenodd">
        <rect
            className="fill-current text-primary"
            width="64"
            height="64"
            rx="32"
        />
        <g transform="translate(22.857 19.429)"
           strokeWidth="2">
            <path
                className="stroke-current text-white"
                strokeLinecap="square"
                d="M12.571 4.571V0H0v25.143h12.571V20.57"
            />
            <path
                className="stroke-current text-white"
                d="M16 12.571h8"
            />
            <path
                className="stroke-current text-white"
                strokeLinecap="square"
                d="M19.429 8L24 12.571l-4.571 4.572"
            />
            <circle
                className="stroke-current text-blue-300"
                strokeLinecap="square"
                cx="12.571"
                cy="12.571"
                r="3.429"
            />
        </g>
    </g>
</svg>;
const iconCards = <svg
    className="w-16 h-16 p-1 -mt-1 mb-2"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
>
    <g fill="none" fillRule="evenodd">
        <rect
            className="fill-current text-primary"
            width="64"
            height="64"
            rx="32"
        />
        <g strokeLinecap="square" strokeWidth="2">
            <path
                className="stroke-current text-white"
                d="M20.571 20.571h13.714v17.143H20.571z"
            />
            <path
                className="stroke-current text-blue-300"
                d="M38.858 26.993l6.397 1.73-4.473 16.549-13.24-3.58"
            />
        </g>
    </g>
</svg>;
const iconArrows = <svg
    className="w-16 h-16 p-1 -mt-1 mb-2"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
>
    <g fill="none" fillRule="evenodd">
        <rect
            className="fill-current text-primary"
            width="64"
            height="64"
            rx="32"
        />
        <g strokeWidth="2">
            <path
                className="stroke-current text-blue-300"
                d="M34.514 35.429l2.057 2.285h8M20.571 26.286h5.715l2.057 2.285"
            />
            <path
                className="stroke-current text-white"
                d="M20.571 37.714h5.715L36.57 26.286h8"
            />
            <path
                className="stroke-current text-blue-300"
                strokeLinecap="square"
                d="M41.143 34.286l3.428 3.428-3.428 3.429"
            />
            <path
                className="stroke-current text-white"
                strokeLinecap="square"
                d="M41.143 29.714l3.428-3.428-3.428-3.429"
            />
        </g>
    </g>
</svg>;
const iconRadar = <svg
    className="w-16 h-16 p-1 -mt-1 mb-2"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
>
    <g fill="none" fillRule="evenodd">
        <rect
            className="fill-current text-primary"
            width="64"
            height="64"
            rx="32"
        />
        <g strokeWidth="2"
           transform="translate(19.429 20.571)">
            <circle
                className="stroke-current text-white"
                strokeLinecap="square"
                cx="12.571"
                cy="12.571"
                r="1.143"
            />
            <path
                className="stroke-current text-white"
                d="M19.153 23.267c3.59-2.213 5.99-6.169 5.99-10.696C25.143 5.63 19.514 0 12.57 0 5.63 0 0 5.629 0 12.571c0 4.527 2.4 8.483 5.99 10.696"
            />
            <path
                className="stroke-current text-blue-300"
                d="M16.161 18.406a6.848 6.848 0 003.268-5.835 6.857 6.857 0 00-6.858-6.857 6.857 6.857 0 00-6.857 6.857 6.848 6.848 0 003.268 5.835"
            />
        </g>
    </g>
</svg>;
