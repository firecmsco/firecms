require('dotenv').config();
module.exports = {
    title: "FireCMS",
    tagline: "Awesome headless CMS based Firestore/Firebase and React, and completely open-source",
    url: "https://firecms.co",
    baseUrl: "/",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/favicon.ico",
    organizationName: "Camberi",
    projectName: "FireCMS",
    customFields: {
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
            id: "star",
            content:
                "You can support FireCMS by giving a ⭐&nbsp;on <strong><a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://github.com/Camberi/firecms\">GitHub</a></strong> ✨",
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
                            label: "Multiple editing options",
                            to: "/f/multiple_editing_options",
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
                    type: "docSidebar",
                    sidebarId: "docsSidebar",
                    label: "Docs",
                    position: "left"
                },
                {
                    to: "blog",
                    label: "Blog",
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
                    href: "https://github.com/Camberi/firecms",
                    // label: 'GitHub',
                    className: "header-github-link",
                    "aria-label": "GitHub repository",
                    position: "right"
                },
                {
                    to: "https://demo.firecms.co",
                    label: "Demo",
                    className: "btn shadow-none mr-2 px-6 py-2 font-bold uppercase",
                    "aria-label": "Open the demo project",
                    position: "right"
                },
                {
                    to: "https://app.firecms.co",
                    label: "Sign in",
                    className: "btn mr-3 px-6 py-2 text-white font-bold uppercase bg-primary hover:text-white hover:bg-blue-700",
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
                            href: "mailto: hello@camberi.com"
                        }
                    ]
                },

                {
                    // Label of the section of these links
                    title: "Links",
                    items: [
                        {
                            label: "Demo",
                            to: "https://demo.firecms.co"
                        },
                        {
                            label: "Camberi",
                            to: "https://camberi.com"
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
            copyright: `MIT © ${new Date().getFullYear()} - camberi`
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
                            label: "2.0.0-alpha",
                            // path: "2.0.0",
                            banner: "unreleased"
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
                    trackingID: process.env.REACT_APP_GTAG_ID
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
