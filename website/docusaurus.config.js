module.exports = {
    title: 'FireCMS',
    tagline: 'Awesome Firestore based headless CMS',
    url: 'https://firecms.co',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'Camberi',
    projectName: 'FireCMS',
    plugins: [
        'docusaurus-tailwindcss-loader',
    ],
    themeConfig: {
        navbar: {
            title: 'FireCMS',
            logo: {
                alt: 'FireCMS Logo',
                src: 'img/logo_small.png'
            },
            items: [
                {
                    to: 'docs/',
                    activeBasePath: 'docs',
                    label: 'Docs',
                    position: 'left'
                },
                {
                    to: 'https://demo.firecms.co',
                    label: 'Demo',
                    position: 'left'
                },
                // { to: 'blog', label: 'Blog', position: 'left' },
                {
                    href: 'https://github.com/Camberi/firecms',
                    // label: 'GitHub',
                    className: 'header-github-link',
                    'aria-label': 'GitHub repository',
                    position: 'right'
                }
            ]
        },
        footer: {
            links: [
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
            copyright: `GPL-3.0 © ${new Date().getFullYear()} - camberi`
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
                // blog: {
                //     showReadingTime: true,
                //     editUrl:
                //         'https://github.com/facebook/docusaurus/edit/master/website/blog/'
                // },
                theme: {
                    customCss: [
                        require.resolve('./src/css/custom.css')
                    ]
                }
            }
        ]
    ]
}
