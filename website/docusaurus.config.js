require('dotenv').config();
module.exports = {
    title: "FireCMS",
    tagline: "Awesome headless CMS based Firestore/Firebase and React, and completely open-source",
    url: "https://firecms.co",
    baseUrl: "/",
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/favicon.ico",
    organizationName: "FireCMS",
    projectName: "FireCMS",
    customFields: {
        env: process.env.NODE_ENV,
        docSearchApiKey: process.env.REACT_APP_DOC_SEARCH_KEY,
        docSearchAppId: process.env.REACT_APP_DOC_SEARCH_APP_ID,
    },
    plugins: [
        "docusaurus-tailwindcss-loader",
        "docusaurus-plugin-sass",
        [
            "docusaurus-plugin-typedoc",
            {
                entryPoints: [
                    "../lib/src/index.ts",
                ],
                tsconfig: "../lib/tsconfig.json",
                watch: process.env.TYPEDOC_WATCH,
            }
        ]
    ],
    themeConfig: {
        image: "img/logo_small.png",
        announcementBar: {
            id: "openai",
            content:
                "Be the first to try out <a href='/openai'>ChatGPT content generation integration plugin</a>! 🚀",
            backgroundColor: "#FF5B79",
            textColor: "black",
            isCloseable: true,
        },
        metadata: [
            {
                name: "twitter:card",
                content: "summary"
            }
        ],
        colorMode: {
            defaultMode: "dark",
            respectPrefersColorScheme: false,
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
                            label: "Advanced content editing",
                            to: "/f/advanced_forms",
                        },
                        {
                            label: "The most powerful backend",
                            to: "/f/backend_extension",
                        },
                    ],
                    position: "left"
                },
                {
                    to: "enterprise",
                    label: "Enterprise",
                    position: "left"
                },
                {
                    to: "openai",
                    label: "ChatGPT",
                    position: "left"
                },
                // {
                //     to: "pricing",
                //     label: "Pricing",
                //     position: "left"
                // },
                {
                    type: "docSidebar",
                    sidebarId: "docsSidebar",
                    label: "Docs",
                    position: "left"
                },
                {
                    type: "html",
                    position: "right",
                    value: "<div id=\"docsearch\"></div>"
                },
                {
                    type: "docsVersionDropdown",
                    position: "right",
                    dropdownActiveClassDisabled: true,
                },
                {
                    type: "html",
                    position: "right",
                    value: `
                    <iframe 
                    style="    transform: translate(0px, 4px);"
                                src="https://ghbtns.com/github-btn.html?user=Camberi&repo=FireCMS&type=star&count=true&size=large"
                                frameBorder="0" scrolling="0"
                                width="140"
                                height="32" 
                                title="GitHub"/>
                    `
                },
                // {
                //     href: "https://github.com/Camberi/firecms",
                //     // label: 'GitHub',
                //     className: "header-github-link",
                //     "aria-label": "GitHub repository",
                //     position: "right"
                // },
                {
                    to: "https://demo.firecms.co",
                    label: "Demo",
                    // className: "btn shadow-none mr-2 px-6 py-2  uppercase",
                    className: "btn mr-3 px-6 py-2 text-white  uppercase bg-primary hover:text-white hover:bg-blue-700",
                    "aria-label": "Open the demo project",
                    position: "right"
                },
                // {
                //     to: "https://app.firecms.co",
                //     label: "Sign in",
                //     className: "btn mr-3 px-6 py-2 text-white  uppercase bg-primary hover:text-white hover:bg-blue-700",
                //     "aria-label": "Go to FireCMS Cloud",
                //     position: "right"
                // },
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
                        }
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
                            href: "https://github.com/Camberi/firecms"
                        },
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
        prism: {
            theme: require("prism-react-renderer/themes/vsDark")
        }
    },
    presets: [
        [
            "@docusaurus/preset-classic",
            {
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    lastVersion: "current",
                    editUrl: "https://github.com/Camberi/firecms/tree/website/website",
                    versions: {
                        "1.0.0": {
                            label: "1.0.0",
                            path: "1.0.0",
                        },
                        current: {
                            label: "2.0.0-beta",
                        }
                    },
                },
                blog: {
                    showReadingTime: true
                },
                // theme: {
                //     customCss: [
                //         require.resolve("./src/css/custom.css"),
                //     ]
                // },
                gtag: {
                    trackingID: process.env.REACT_APP_GTAG_ID ?? "G-D4DQQCW88S"
                },
                sitemap: {
                    changefreq: 'weekly',
                    priority: 0.5,
                    filename: 'sitemap.xml'
                },
            }
        ]
    ]
}
