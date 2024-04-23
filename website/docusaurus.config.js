const fontaine = require("fontaine");
const path = require("path");
import { themes as prismThemes } from "prism-react-renderer";

require("dotenv").config();

const generateAPI = process.env.REACT_GENERATE_API === "true";

module.exports = {
    title: "FireCMS",
    tagline: "Discover the power of FireCMS, an open-source headless CMS expertly crafted for Firestore/Firebase and React. Enjoy real-time data handling, efficient content management, and customizable features that enhance your workflow. With FireCMS, you gain access to a developer-centric platform that propels your projects forward. Dive into a world of streamlined development and bring your digital visions to life with FireCMS.",
    url: "https://firecms.co",
    baseUrl: "/",
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/favicon.ico",
    organizationName: "FireCMS S.L.",
    projectName: "FireCMS",
    customFields: {
        env: process.env.NODE_ENV,
        docSearchApiKey: process.env.REACT_APP_DOC_SEARCH_KEY,
        docSearchAppId: process.env.REACT_APP_DOC_SEARCH_APP_ID,
    },
    webpack: {},

    plugins: [
        "docusaurus-tailwindcss-loader",
        "docusaurus-plugin-sass",
        // generateAPI ? [
        //     "docusaurus-plugin-typedoc",
        //     {
        //         watch: false,
        //     }
        // ] : [],
        function () {

            return {
                name: "local-links",
                configureWebpack(_config, _isServer) {
                    return {
                        resolve: {
                            alias: {
                                "@firecms/cloud": path.resolve(__dirname, "../packages/firecms_cloud/src"),
                                "@firecms/core": path.resolve(__dirname, "../packages/firecms_core/src"),
                                "@firecms/ui": path.resolve(__dirname, "../packages/ui/src"),
                                "@firecms/collection_editor": path.resolve(__dirname, "../packages/collection_editor/src"),
                                "@firecms/firebase": path.resolve(__dirname, "../packages/firebase_firecms/src"),
                                "@firecms/data_import_export": path.resolve(__dirname, "../packages/data_import_export/src"),
                                "@firecms/schema_inference": path.resolve(__dirname, "../packages/schema_inference/src"),
                                "@firecms/data_enhancement": path.resolve(__dirname, "../packages/data_enhancement/src"),
                                "@firecms/formex": path.resolve(__dirname, "../packages/formex/src"),
                            },
                        },
                        optimization: {
                            usedExports: true, // <- remove unused function
                        }
                    };
                },
            };
        },
        function fontainePlugin(_context, _options) {
            return {
                name: "fontaine-plugin",
                configureWebpack(_config, _isServer) {
                    return {
                        plugins: [
                            fontaine.FontaineTransform.webpack({
                                fallbacks: [
                                    "system-ui",
                                    "-apple-system",
                                    "BlinkMacSystemFont",
                                    "Segoe UI",
                                    "Roboto",
                                    "Oxygen",
                                    "Ubuntu",
                                    "Cantarell",
                                    "Open Sans",
                                    "Helvetica Neue",
                                    "sans-serif",
                                ],
                                // You may need to resolve assets like `/fonts/Poppins-Bold.ttf` to a particular directory
                                resolvePath: (id) => "../fonts/" + id,
                            }),
                        ],
                    };
                },
            };
        },
    ],
    themeConfig: {
        image: "img/logo_small.png",
        description: "Awesome headless CMS based Firestore/Firebase and React, and completely open-source",
        announcementBar: {
            id: "beta-6",
            content: "<b>FireCMS</b> <code>3.0.0-beta.6</code> is out now! 🚀 FireCMS PRO is ready for testing at a discounted price. <a href='/pro'>Learn more</a>",
            backgroundColor: "#FF5B79",
            textColor: "black",
            isCloseable: true,
        },
        metadata: [
            {
                name: "twitter:card",
                content: "summary"
            },
            {
                name: "keywords",
                content: "firebase, cms, react, react cms, firestore, firebase cms, headless cms, firebase admin, firebase admin sdk, strapi, contentful, rowy, forest admin, ghost cms, keystone, wordpress, payload"
            },
        ],
        headTags: [
            // Declare some json-ld structured data
            {
                tagName: "script",
                attributes: {
                    type: "application/ld+json",
                },
                innerHTML: JSON.stringify({
                    "@context": "https://schema.org/",
                    "@type": "Organization",
                    name: "Meta Open Source",
                    url: "https://opensource.fb.com/",
                    logo: "https://opensource.fb.com/img/logos/Meta-Open-Source.svg",
                }),
            },
        ],

        colorMode: {
            defaultMode: "light",
            disableSwitch: false,
            // respectPrefersColorScheme: false,
        },
        navbar: {
            title: "FireCMS",
            logo: {
                alt: "FireCMS Logo",
                src: "img/firecms_logo.svg"
            },
            items: [
                {
                    label: "Product",
                    to: "features",
                    items: [
                        {
                            label: "Features",
                            to: "/features",
                        },
                        {
                            label: "OpenAI GPT integration",
                            to: "/openai",
                        },
                        {
                            label: "The most powerful backend",
                            to: "/f/backend_extension",
                        },
                    ],
                    position: "left"
                },
                // {
                //     to: "openai",
                //     label: "ChatGPT",
                //     position: "left"
                // },
                {
                    to: "pricing",
                    label: "Pricing",
                    position: "left"
                },
                {
                    label: "Blog",
                    to: "blog",
                    position: "left"
                },
                {
                    type: "docSidebar",
                    sidebarId: "docsSidebar",
                    label: "Docs",
                    position: "left"
                },
                {
                    label: "Pro",
                    to: "pro",
                    className: "gradient-text",
                    position: "left"
                },
                {
                    type: "html",
                    position: "right",
                    value: "<div id=\"docsearch\"></div>"
                },
                // {
                //     type: "html",
                //     position: "right",
                //     value: `
                //     <iframe style="transform: translate(0px, 4px);"
                //             src="https://ghbtns.com/github-btn.html?user=FireCMSco&repo=FireCMS&type=star&count=true&size=large"
                //             frameBorder="0"
                //             scrolling="0"
                //             width="140"
                //             height="32"
                //             title="GitHub"/>
                //     `
                // },
                {
                    type: "docsVersionDropdown",
                    position: "right",
                    dropdownActiveClassDisabled: true,
                },
                {
                    href: "https://github.com/FireCMSco/firecms",
                    className: "header-github-link",
                    "aria-label": "GitHub repository",
                    position: "right"
                },
                {
                    href: "*",
                    className: "colorSwitch",
                    position: "right"
                },
                {
                    to: "https://demo.firecms.co",
                    label: "Demo",
                    className: "border-1 border-slate-600 dark:border-slate-700 uppercase rounded border-solid dark:text-white text-white hover:text-slate-100 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 dark:hover:border-slate-800 text-center btn mr-3 px-6 py-2",
                    "aria-label": "Open the demo project",
                    position: "right"
                },
                {
                    to: "https://app.firecms.co",
                    label: "Sign in",
                    className: "btn mr-3 px-6 py-2 text-white uppercase bg-primary hover:text-white hover:bg-blue-700",
                    "aria-label": "Go to FireCMS Cloud",
                    position: "right"
                },
            ]
        },
        footer: {
            links: [
                {
                    title: "Get in touch",
                    items: [
                        {
                            label: "Contact",
                            href: "mailto: hello@firecms.co"
                        },
                        {
                            label: "Book a meeting",
                            href: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0INW8ihjQ90S4gkdo8_rbL_Zx7gagZShLIpHyW43zDXkQDPole6a1coo1sT2O6Gl05X8lxFDlp?gv=true"
                        }
                    ]
                },

                {
                    // Label of the section of these links
                    title: "Links",
                    items: [
                        {
                            to: "https://app.firecms.co/subscriptions",
                            label: "Manage subscriptions",
                        },
                        {
                            label: "Demo",
                            to: "https://demo.firecms.co"
                        },
                        {
                            label: "FireCMS PRO",
                            to: "pro",
                        },
                        {
                            label: "Blog",
                            to: "blog",
                        },
                        {
                            label: "Privacy policy",
                            to: "/policy/privacy_policy"
                        },
                        {
                            label: "Terms and conditions",
                            to: "/policy/terms_conditions"
                        },
                        {
                            label: "Cookies policy",
                            to: "/policy/cookies_policy"
                        },
                    ]
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "Discord",
                            href: "https://discord.gg/fxy7xsQm3m"
                        },
                        {
                            label: "Github",
                            href: "https://github.com/FireCMSco/firecms"
                        },
                        {
                            html: `<iframe src="https://github.com/sponsors/firecmsco/button" title="Sponsor FireCMS" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>
                                `,
                        },
                        // {
                        //     html: `<iframe
                        //                 src="https://ghbtns.com/github-btn.html?user=FireCMSco&repo=FireCMS&type=star&count=true&size=large"
                        //                 frameBorder="0"
                        //                 scrolling="0"
                        //                 width="140"
                        //                 height="32"
                        //                 title="GitHub"/> `
                        // }
                    ]
                },
                // {
                //     // title: "Community",
                //     items: [
                //         {
                //             //Renders the html pass-through instead of a simple link
                //             html: `
                //           <iframe
                // src="https://discordapp.com/widget?id=1013768502458470442&theme=dark"
                // width="300"
                // height="300"
                // allowTransparency="true"
                // frameBorder="0"
                // sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                //         `,
                //         },
                //     ]
                // }
            ],
            copyright: `© ${new Date().getFullYear()} - FireCMS S.L.`
        },
        prism: {
            theme: prismThemes.vsDark,
        }
    },
    presets: [
        [
            "@docusaurus/preset-classic",
            {
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    lastVersion: "current",
                    editUrl: "https://github.com/FireCMSco/firecms/tree/main/website",
                    versions: {
                        "2.0.0": {
                            label: "2.0.0",
                            path: "2.0.0",
                            banner: "none"
                        },
                        "1.0.0": {
                            label: "1.0.0",
                            path: "1.0.0",
                            banner: "unmaintained"
                        },
                        current: {
                            label: "3.0.0-beta",
                        }
                    },
                },
                blog: {
                    showReadingTime: true,
                    feedOptions: {
                        type: "all",
                    }
                },
                gtag: {
                    trackingID: process.env.REACT_APP_GTAG_ID ?? "G-D4DQQCW88S"
                },
                sitemap: {
                    changefreq: "weekly",
                    priority: 0.5,
                    filename: "sitemap.xml",
                    ignorePatterns: ['/docs/2.0.0/**', '/docs/1.0.0/**'],
                },
            }
        ]
    ]
}
