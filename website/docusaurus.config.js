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
                    label: "Features",
                    items: [
                        {
                            label: "Multiple editing options",
                            to: "/features/multiple_editing_options",
                        },
                        {
                            label: "Advanced content editing",
                            to: "/features/advanced_forms",
                        },
                        {
                            label: "The most powerful backend",
                            to: "/features/backend_extension",
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
                    type: "docsVersionDropdown",
                    position: "right",
                    dropdownActiveClassDisabled: true,
                },
                {
                    to: "https://demo.firecms.co",
                    label: "Demo",
                    className: "btn mr-2 px-6 py-2 text-white font-bold uppercase bg-blue-600 hover:text-white hover:bg-blue-700",
                    "aria-label": "Open the demo project",
                    position: "right"
                },
                {
                    href: "https://github.com/Camberi/firecms",
                    // label: 'GitHub',
                    className: "mr-2 header-github-link",
                    "aria-label": "GitHub repository",
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
                            to: "/privacy_policy"
                        },
                        {
                            label: "Terms and conditions",
                            to: "/terms_conditions"
                        },
                        {
                            label: "Cookies policy",
                            to: "/cookies_policy"
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
                        // {
                        //     label: 'Discord',
                        //     href: 'https://discordapp.com/invite/docusaurus',
                        // },
                        // {
                        //     label: 'Twitter',
                        //     href: 'https://twitter.com/docusaurus',
                        // },
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
                theme: {
                    customCss: [
                        require.resolve("./src/css/custom.css"),
                    ]
                },
                gtag: {
                    trackingID: "G-NL75PPNYXD"
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
