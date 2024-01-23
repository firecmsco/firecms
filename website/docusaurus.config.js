const fontaine = require("fontaine");
const path = require("path");
require("dotenv").config();

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
        // [
        //     "docusaurus-plugin-typedoc",
        //     {
        //         watch: false,
        //     }
        // ],
        function () {

            return {
                name: "local-links",
                configureWebpack(_config, _isServer) {
                    return {
                        resolve: {
                            alias: {
                                "firecms": path.resolve(__dirname, "../packages/firecms/src"),
                                "@firecms/ui": path.resolve(__dirname, "../packages/ui/src"),
                            },
                        },
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
        announcementBar: {
            id: "local-search",
            content: "Local text search is now available for <b>PLUS</b> users! 🎉",
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
                content: "firebase, cms, react, react cms, firestore, firebase cms, headless cms, firebase admin, firebase admin sdk, strapi, contentful, rowy, forest admin, ghost cms, keystone, wordpress"
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
            defaultMode: "dark",
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
                    type: "docSidebar",
                    sidebarId: "docsSidebar",
                    label: "Docs",
                    position: "left"
                },
                {
                    label: "Blog",
                    to: "blog",
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
                    // label: 'GitHub',
                    className: "header-github-link",
                    "aria-label": "GitHub repository",
                    position: "right"
                },
                {
                    to: "https://demo.firecms.co",
                    label: "Demo",
                    // className: "btn shadow-none mr-2 px-6 py-2  uppercase",
                    className: "border-1 border-slate-600 dark:border-slate-700  uppercase rounded border-solid dark:text-white text-slate-800 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 h dark:hover:border-slate-800 text-center btn mr-3 px-6 py-2",
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
                        }
                    ]
                },

                {
                    // Label of the section of these links
                    title: "Links",
                    items: [
                        {
                            to: "enterprise",
                            label: "Enterprise",
                        },
                        {
                            to: "https://app.firecms.co/subscriptions",
                            label: "Manage subscriptions",
                        },
                        {
                            label: "Demo",
                            to: "https://demo.firecms.co"
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
                {
                    // title: "Community",
                    items: [
                        {
                            //Renders the html pass-through instead of a simple link
                            html: `
                          <iframe
                src="https://discordapp.com/widget?id=1013768502458470442&theme=dark"
                width="300"
                height="300"
                allowTransparency="true"
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                        `,
                        },
                    ]
                }
            ],
            copyright: `MIT © ${new Date().getFullYear()} - FireCMS S.L.`
        },
        // prism: {
        //     theme: require("prism-react-renderer/themes/vsDark")
        // }
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
                    showReadingTime: true
                },
                gtag: {
                    trackingID: process.env.REACT_APP_GTAG_ID ?? "G-D4DQQCW88S"
                },
                sitemap: {
                    changefreq: "weekly",
                    priority: 0.5,
                    filename: "sitemap.xml"
                },
            }
        ]
    ]
}
