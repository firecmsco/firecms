import { themes as prismThemes } from "prism-react-renderer";

// const fontaine = require("fontaine");
import path from "path";
import { config } from "dotenv";

import { defineReactCompilerLoaderOption, reactCompilerLoader } from "react-compiler-webpack";

config();

const generateAPI = process.env.REACT_GENERATE_API === "true";

module.exports = {
    title: "FireCMS",
    tagline: "Discover the power of FireCMS, an open-source headless CMS expertly crafted for Firestore/Firebase and React. Enjoy real-time data handling, efficient content management, and customizable features that enhance your workflow. With FireCMS, you gain access to a developer-centric platform that propels your projects forward. Dive into a world of streamlined development and bring your digital visions to life with FireCMS.",
    url: "https://firecms.co",
    baseUrl: "/",
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/firecms_logo.svg",
    organizationName: "FireCMS S.L.",
    projectName: "FireCMS",
    trailingSlash: false,
    customFields: {
        env: process.env.NODE_ENV,
        docSearchApiKey: process.env.REACT_APP_DOC_SEARCH_KEY,
        docSearchAppId: process.env.REACT_APP_DOC_SEARCH_APP_ID
    },
    future: {
        experimental_faster: {
            swcJsLoader: true,
            swcJsMinimizer: true,
            swcHtmlMinimizer: true,
            lightningCssMinimizer: true,
            rspackBundler: true,
            mdxCrossCompilerCache: true,
        },
    },
    webpack: {
        // rules: [
        //     {
        //         test: /\.js$/,
        //         use: [
        //             {
        //                 loader: "builtin:swc-loader",
        //                 options: {
        //                     // SWC options for JS
        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         test: /\.jsx$/,
        //         use: [
        //             {
        //                 loader: "builtin:swc-loader",
        //                 options: {
        //                     // SWC options for JSX
        //                 },
        //             },
        //             { loader: "babel-loader" },
        //         ],
        //     },
        // ],
    },
    plugins: [
        "docusaurus-tailwindcss-loader",
        "docusaurus-plugin-sass",
        require.resolve("./plugins/docusaurus-plugin-inline-css"),
        generateAPI ?
            [
                "docusaurus-plugin-typedoc",
                {
                    watch: false,
                    skipErrorChecking: true,
                    readme: "docs/api_index.md"
                }
            ]
            : null,
        // [
        //     "docusaurus-plugin-typedoc-api",
        //     {
        //         projectRoot: path.join(__dirname, ".."),
        //         // Monorepo
        //         packages: ["packages/firecms_core"],
        //         routeBasePath: "docs/api"
        //     }
        // ],
        // generateAPI ? [
        //     "docusaurus-plugin-typedoc-api",
        //     {
        //         projectRoot: path.join(__dirname, ".."),
        //         // Monorepo
        //         packages: ["packages/firecms_core"]
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
                                "@firecms/data_import": path.resolve(__dirname, "../packages/data_import/src"),
                                "@firecms/data_export": path.resolve(__dirname, "../packages/data_export/src"),
                                "@firecms/schema_inference": path.resolve(__dirname, "../packages/schema_inference/src"),
                                "@firecms/data_enhancement": path.resolve(__dirname, "../packages/data_enhancement/src"),
                                "@firecms/formex": path.resolve(__dirname, "../packages/formex/src")
                            }
                        },
                        optimization: {
                            usedExports: true // <- remove unused function
                        }
                    };
                }
            };
        },
        // function fontainePlugin(_context, _options) {
        //     return {
        //         name: "fontaine-plugin",
        //         configureWebpack(_config, _isServer) {
        //             return {
        //                 plugins: [
        //                     fontaine.FontaineTransform.webpack({
        //                         fallbacks: [
        //                             "system-ui",
        //                             "-apple-system",
        //                             "BlinkMacSystemFont",
        //                             "Segoe UI",
        //                             "Roboto",
        //                             "Oxygen",
        //                             "Ubuntu",
        //                             "Cantarell",
        //                             "Open Sans",
        //                             "Helvetica Neue",
        //                             "sans-serif"
        //                         ],
        //                         // You may need to resolve assets like `/fonts/Poppins-Bold.ttf` to a particular directory
        //                         resolvePath: (id) => "../fonts/" + id
        //                     })
        //                 ]
        //             };
        //         }
        //     };
        // },
        function reactCompiler(_context, _options) {
            return {
                name: "react-compiler-plugin",
                configureWebpack(_config, _isServer) {
                    return {
                        module: {
                            rules: [
                                {
                                    test: /\.[mc]?[jt]sx?$/i,
                                    exclude: /node_modules/,
                                    use: [
                                        {
                                            loader: reactCompilerLoader,
                                            options: defineReactCompilerLoaderOption({
                                                // React Compiler options goes here
                                            })
                                        }
                                    ]
                                }
                            ]
                        }
                    };
                }
            };
        }
    ].filter(Boolean),
    // clientModules: [
    //     require.resolve("./src/clientModules/analytics.js")
    // ],
    themeConfig:
        {
            image: "img/logo_small.png",
            description:
                "Headless CMS based on Firestore/Firebase, React and tailwindcss, and completely open-source",
            announcementBar:
                {
                    id: "dataki-announcement",
                    content:
                        "<code>DATAKI</code> is our new <b>AI analytics tool</b> for SQL databases. It is amazing! 🚀 <a href='https://dataki.ai?utm_source=firecms_landing'>Check it out!</a>",
                    backgroundColor:
                        "#FF5B79",
                    textColor:
                        "black",
                    isCloseable:
                        true
                }
            ,
            metadata: [
                {
                    name: "twitter:card",
                    content: "summary"
                }
            ],
            colorMode:
                {
                    defaultMode: "light",
                    disableSwitch:
                        false
                    // respectPrefersColorScheme: false,
                }
            ,
            navbar: {
                title: "FireCMS",
                logo: {
                    alt: "FireCMS Logo",
                    src:
                        "img/firecms_logo.svg"
                },
                items: [
                    {
                        label: "Why FireCMS",
                        to: "features",
                        items: [
                            {
                                label: "For content editors",
                                to: "/features",
                                customPosition: "left"
                            },
                            {
                                label: "For developers",
                                to: "/developers",
                                customPosition: "left"
                            },
                            {
                                label: "For startups",
                                to: "/startups",
                                customPosition: "left"
                            },
                            {
                                label: "For agencies",
                                to: "/agencies",
                                customPosition: "left"
                            },
                            {
                                label: "UI components",
                                to: "/ui",
                                customPosition: "right"
                            },
                            {
                                label: "AI integration",
                                to: "/openai",
                                customPosition: "right"
                            },
                            {
                                label: "The most powerful backend",
                                to: "/f/backend_extension",
                                customPosition: "right"
                            },
                            {
                                to: "/security",
                                label: "Security & Privacy",
                                customPosition: "right"
                            }
                        ],
                        position: "left"
                    },
                    {
                        to: "pricing",
                        label: "Pricing",
                        position: "left"
                    },
                    // {
                    //     label: "Blog",
                    //     to: "blog",
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
                        position: "left",
                        value: "<div class='bg-gray-100 rounded-lg'><a class='gradient-text navbar__item navbar__link' href='/pro'>PRO</a></div>"
                    },
                    // {
                    //     type: "html",
                    //     position: "right",
                    //     value: "<div id=\"docsearch\"></div>"
                    // },
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
                        dropdownActiveClassDisabled: true
                    },
                    {
                        href: "https://github.com/FireCMSco/firecms",
                        className: "header-github-link",
                        "aria-label": "GitHub repository",
                        position: "right",
                        customProps: {
                            eventName: "go_to_github"
                        },
                    },
                    {
                        href: "*",
                        className: "colorSwitch",
                        position: "right"
                    },
                    {
                        to: "https://demo.firecms.co",
                        label: "Demo",
                        className: "border-1 border-surface-600 border-surface-700 uppercase rounded border-solid text-white hover:text-surface-100 hover:bg-surface-100 text-center btn mr-3 px-2 md:px-6 py-2",
                        "aria-label": "Open the demo project",
                        customProps: {
                            eventName: "go_to_demo"
                        },
                        position: "right"
                    },
                    {
                        to: "https://app.firecms.co",
                        label: "Sign in",
                        className: "btn mr-3 px-4 md:px-6 py-2 text-white uppercase bg-primary hover:text-white hover:bg-blue-700",
                        "aria-label": "Go to FireCMS Cloud",
                        "id": "sign-in-btn",
                        customProps: {
                            eventName: "go_to_app"
                        },
                        position: "right"
                    }
                ]
            }
            ,
            footer: {
                links: [
                    {
                        title: "Get in touch",
                        items: [
                            {
                                label: "hello@firecms.co",
                                href: "mailto:hello@firecms.co"
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
                                label: "Manage subscriptions"
                            },
                            {
                                to: "https://app.firecms.co",
                                label: "FireCMS Cloud"
                            },
                            {
                                label: "Demo",
                                to: "https://demo.firecms.co"
                            },
                            {
                                label: "FireCMS PRO",
                                to: "pro"
                            },
                            {
                                label: "llms.txt",
                                href: "https://firecms.co/llms.txt"
                            },
                            {
                                label: "Blog",
                                to: "blog"
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
                                href: "https://github.com/FireCMSco/firecms"
                            },
                            {
                                html: `<iframe src="https://github.com/sponsors/firecmsco/button" title="Sponsor FireCMS" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>
                                `
                            }
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
                    }
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
                copyright:
                    `We are based in Madrid, Spain, Europe 🇪🇺 - © ${new Date().getFullYear()} - FireCMS S.L.`
            }
            ,
            prism: {
                theme: prismThemes.vsDark
            }
        }
    ,
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
                        current: {
                            label: "3.0.0-beta"
                        }
                    }
                },
                blog: {
                    showReadingTime: true,
                    blogSidebarCount: 0,
                    feedOptions: {
                        type: "all"
                    }
                },
                gtag: {
                    trackingID: process.env.REACT_APP_GTAG_ID ?? "G-D4DQQCW88S"
                },
                sitemap: {
                    changefreq: "weekly",
                    priority: 0.5,
                    filename: "sitemap.xml",
                    ignorePatterns: ["/docs/2.0.0/**", "/docs/1.0.0/**"],
                    createSitemapItems: async (params) => {
                        const {
                            defaultCreateSitemapItems,
                            ...rest
                        } = params;
                        const items = await defaultCreateSitemapItems(rest);

                        const prioritiedItems = items.map(item => {
                            if (item.url === "https://firecms.co") {
                                item.priority = 1.0;
                            } else if (item.url === "https://firecms.co/") {
                                item.priority = 1.0;
                            } else if (item.url.startsWith("https://firecms.co/blog")) {
                                item.priority = 0.6;
                            } else if (item.url.startsWith("https://firecms.co/pricing")) {
                                item.priority = 0.9;
                            } else if (item.url.startsWith("https://firecms.co/pro")) {
                                item.priority = 0.9;
                            } else if (item.url.startsWith("https://firecms.co/ui")) {
                                item.priority = 0.8;
                            } else if (item.url.startsWith("https://firecms.co/features")) {
                                item.priority = 0.8;
                            } else if (item.url.startsWith("https://firecms.co/agencies")) {
                                item.priority = 0.8;
                            } else if (item.url.startsWith("https://firecms.co/developers")) {
                                item.priority = 0.8;
                            } else if (item.url.startsWith("https://firecms.co/startups")) {
                                item.priority = 0.8;
                            } else if (item.url.startsWith("https://firecms.co/docs/api")) {
                                item.priority = 0.3;
                            } else if (item.url.startsWith("https://firecms.co/docs")) {
                                item.priority = 0.6;
                            }

                            if (item.url.endsWith("/")) {
                                item.url = item.url.slice(0, -1);
                            }
                            return item;
                        });
                        return prioritiedItems;
                    }
                }
            }
        ]
    ]
}
