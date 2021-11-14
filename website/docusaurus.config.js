module.exports = {
    title: 'FireCMS - Firestore/Firebase headless CMS',
    tagline: 'Awesome headless CMS based Firestore/Firebase and React, and completely open-source',
    url: 'https://firecms.co',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'Camberi',
    projectName: 'FireCMS',
    plugins: [
        'docusaurus-tailwindcss-loader',
        [
            'docusaurus-plugin-typedoc',
            {
                entryPoints: [
                    '../src/index.ts',
                    // '../src/core/index.tsx',
                    // '../src/models/index.ts',
                    // '../src/collection/index.tsx',
                    // '../src/contexts/index.tsx',
                    // '../src/form/index.tsx',
                    // '../src/preview/index.ts',
                    // '../src/side_dialog/index.ts',
                    // '../src/hooks/index.tsx',
                ],
                tsconfig: '../tsconfig.json',
                watch: process.env.TYPEDOC_WATCH,
            }
        ]
    ],
    themeConfig: {
        announcementBar: {
            id: 'new_version',
            content:
                'Version 1.0.0-beta4 is out! 🎉 Check the <a target="_blank" rel="noopener noreferrer" href="/docs/migrating_from_alpha_versions">migration guide</a>',
            backgroundColor: '#FF5B79',
            textColor: 'black',
            isCloseable: true,
        },
        colorMode:{
            defaultMode: 'dark',
            respectPrefersColorScheme: false,
        },
        navbar: {
            title: 'FireCMS',
            logo: {
                alt: 'FireCMS Logo',
                src: 'img/firecms_logo.svg'
            },
            items: [
                {
                    to: 'docs',
                    activeBaseRegex: 'docs(/)?$',
                    label: 'Docs',
                    position: 'left'
                },
                {
                    to: 'docs/api',
                    // activeBasePath: 'api',
                    label: 'API',
                    position: 'left'
                },
                {
                    to: 'blog',
                    label: 'Blog',
                    position: 'left'
                },
                {
                    to: 'https://demo.firecms.co',
                    label: 'Demo',
                    className: "btn mr-2 px-6 py-2 text-white font-bold uppercase bg-blue-600 hover:text-white hover:bg-blue-700",
                    'aria-label': 'Open the demo project',
                    position: 'right'
                },
                {
                    href: 'https://github.com/Camberi/firecms',
                    // label: 'GitHub',
                    className: 'mr-2 header-github-link',
                    'aria-label': 'GitHub repository',
                    position: 'right'
                }
            ]
        },
        footer: {
            links: [
                {
                    title: 'Get in touch',
                    items: [
                        {
                            label: 'Contact',
                            href: 'mailto: hello@camberi.com'
                        }
                    ]
                },

                {
                    // Label of the section of these links
                    title: 'Links',
                    items: [
                        {
                            label: 'Docs',
                            to: 'docs/'
                        },
                        {
                            label: 'Demo',
                            to: 'https://demo.firecms.co'
                        },
                        {
                            label: 'Camberi',
                            to: 'https://camberi.com'
                        }
                    ]
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'Reddit',
                            href: 'https://www.reddit.com/r/firecms/'
                        },
                        {
                            label: 'Github',
                            href: 'https://github.com/Camberi/firecms'
                        }
                        // {
                        //     label: 'Discord',
                        //     href: 'https://discordapp.com/invite/docusaurus',
                        // },
                        // {
                        //     label: 'Twitter',
                        //     href: 'https://twitter.com/docusaurus',
                        // },
                        //           {
                        //               //Renders the html pass-through instead of a simple link
                        //               html: `
                        //   <a href="https://www.netlify.com" target="_blank" rel="noreferrer noopener" aria-label="Deploys by Netlify">
                        //     <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Deploys by Netlify" />
                        //   </a>
                        // `,
                        //           },
                    ]
                }
            ],
            copyright: `MIT © ${new Date().getFullYear()} - camberi`
        },
        prism: {
            theme: require('prism-react-renderer/themes/vsDark')
        },
        gtag: {
            trackingID: 'G-D4DQQCW88S'
        }
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js')
                },
                // blog: false,
                blog: {
                    showReadingTime: true,
                    // editUrl:
                    //     'https://github.com/facebook/docusaurus/edit/master/website/blog/'
                },
                theme: {
                    customCss: [
                        require.resolve('./src/css/custom.css'),
                    ]
                }
            }
        ]
    ]
}
