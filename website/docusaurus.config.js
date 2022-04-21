module.exports = {
    title: 'FireCMS',
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
        'docusaurus-plugin-sass',
        [
            'docusaurus-plugin-typedoc',
            {
                entryPoints: [
                    '../lib/src/index.ts',
                ],
                tsconfig: '../lib/tsconfig.json',
                watch: process.env.TYPEDOC_WATCH,
            }
        ]
    ],
    themeConfig: {
        image: 'img/firecms_logo.svg',
        announcementBar: {
            id: 'new_version_rc.4',
            content:
                'Version 1.0.0-rc.4 is out! 🎉 Check the <a target="_blank" rel="noopener noreferrer" href="/docs/1.0.0/quickstart">quickstart</a> to get started!',
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
                    type: 'docSidebar',
                    sidebarId: 'docsSidebar',
                    label: 'Docs',
                    position: 'left'
                },
                {
                    type: 'docSidebar',
                    position: 'left',
                    sidebarId: 'apiSidebar',
                    label: 'API',
                },
                {
                    to: 'blog',
                    label: 'Blog',
                    position: 'left'
                },
                {
                    type: 'docsVersionDropdown',
                    position: 'right',
                    dropdownActiveClassDisabled: true,
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
                },
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
        }
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    lastVersion: "1.0.0",
                    editUrl: "https://github.com/Camberi/firecms/tree/master/website",
                    versions: {
                        current: {
                            label: '2.0.0-alpha',
                            path: '2.0.0',
                            banner: "unreleased"
                        },
                        "1.0.0": {
                            label: '1.0.0',
                            path: '1.0.0'
                        },
                    },
                },
                blog: {
                    showReadingTime: true
                },
                theme: {
                    customCss: [
                        require.resolve('./src/css/custom.css'),
                    ]
                },
                gtag: {
                    trackingID: 'G-NL75PPNYXD'
                }
            }
        ]
    ]
}
