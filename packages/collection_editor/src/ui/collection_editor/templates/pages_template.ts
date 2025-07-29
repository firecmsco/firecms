import { EntityCollection } from "@firecms/core";

export const pagesCollectionTemplate: EntityCollection = {
    slug: "pages",
    dbPath: "pages",
    name: "Pages",
    singularName: "Page",
    icon: "insert_drive_file",
    description: "List of website pages that can be edited here",
    properties: {
        title: {
            type: "string",
            name: "Page Title",
            validation: { required: true }
        },
        slug: {
            type: "string",
            name: "URL Slug",
            validation: {
                required: true,
                unique: true,
                matches: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                matchesMessage: "Must be lowercase, alphanumeric, and hyphenated"
            }
        },
        hero_section: {
            type: "map",
            name: "Hero Section",
            properties: {
                headline: {
                    type: "string",
                    name: "Headline",
                    validation: { required: true }
                },
                subhead: {
                    type: "string",
                    name: "Subheadline"
                },
                background_image: {
                    type: "string",
                    name: "Background Image",
                    storage: {
                        storagePath: "page_hero/images",
                        acceptedFiles: ["image/*"],
                    }
                },
                call_to_action: {
                    type: "string",
                    name: "Call to Action"
                },
                call_to_action_link: {
                    type: "string",
                    name: "CTA Link",
                    url: true
                }
            }
        },
        content: {
            type: "array",
            name: "Content",
            oneOf: {
                properties: {
                    section: {
                        type: "map",
                        name: "Section",
                        properties: {
                            title: {
                                type: "string",
                                name: "Section Title",
                                validation: { required: true }
                            },
                            content: {
                                type: "string",
                                name: "Section Content",
                                markdown: true
                            },
                            image: {
                                type: "string",
                                name: "Section Image",
                                storage: {
                                    storagePath: "page_sections/images",
                                    acceptedFiles: ["image/*"]
                                }
                            },
                            link: {
                                type: "string",
                                name: "Section Link",
                                url: true
                            }
                        }
                    },
                    image: {
                        type: "string",
                        name: "Image",
                        storage: {
                            storagePath: "page_sections/images",
                            acceptedFiles: ["image/*"]
                        }
                    },
                    slider: {
                        type: "array",
                        name: "Slider",
                        of: {
                            type: "map",
                            properties: {
                                title: {
                                    type: "string",
                                    name: "Title",
                                    validation: { required: true }
                                },
                                image: {
                                    type: "string",
                                    storage: {
                                        storagePath: "page_sections/images",
                                        acceptedFiles: ["image/*"]
                                    }
                                }
                            }
                        }
                    },
                }
            }
        },
        sidebar: {
            type: "map",
            name: "Sidebar",
            properties: {
                title: {
                    type: "string",
                    name: "Sidebar Title",
                    validation: { required: false }
                },
                content: {
                    type: "string",
                    name: "Sidebar Content",
                    markdown: true
                }
            }
        },
        seo_metadata: {
            type: "map",
            name: "SEO Metadata",
            properties: {
                meta_title: {
                    type: "string",
                    name: "Meta Title"
                },
                meta_description: {
                    type: "string",
                    name: "Meta Description"
                },
                focus_keywords: {
                    type: "array",
                    name: "Focus Keywords",
                    of: {
                        type: "string"
                    }
                }
            }
        },
        footer_override: {
            type: "string",
            name: "Footer Override",
            markdown: true
        },
        publish_date: {
            type: "date",
            name: "Publish Date",
            validation: { required: true }
        },
        last_updated: {
            type: "date",
            name: "Last Updated",
            autoValue: "on_update"
        },
        is_published: {
            type: "boolean",
            name: "Is Published",
            columnWidth: 100,
            description: "Should this page be live on the site?"
        }
    }
};
