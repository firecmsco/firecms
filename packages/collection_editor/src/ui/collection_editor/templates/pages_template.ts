import { EntityCollection } from "@firecms/core";

export const pagesCollectionTemplate: EntityCollection = {
    id: "pages",
    path: "pages",
    name: "Pages",
    singularName: "Page",
    icon: "insert_drive_file",
    description: "List of website pages that can be edited here",
    properties: {
        title: {
            dataType: "string",
            name: "Page Title",
            validation: { required: true }
        },
        slug: {
            dataType: "string",
            name: "URL Slug",
            validation: {
                required: true,
                unique: true,
                matches: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                matchesMessage: "Must be lowercase, alphanumeric, and hyphenated"
            }
        },
        hero_section: {
            dataType: "map",
            name: "Hero Section",
            properties: {
                headline: {
                    dataType: "string",
                    name: "Headline",
                    validation: { required: true }
                },
                subhead: {
                    dataType: "string",
                    name: "Subheadline"
                },
                background_image: {
                    dataType: "string",
                    name: "Background Image",
                    storage: {
                        storagePath: "page_hero/images",
                        acceptedFiles: ["image/*"],
                    }
                },
                call_to_action: {
                    dataType: "string",
                    name: "Call to Action"
                },
                call_to_action_link: {
                    dataType: "string",
                    name: "CTA Link",
                    url: true
                }
            }
        },
        content: {
            dataType: "array",
            name: "Content",
            oneOf: {
                properties: {
                    section: {
                        dataType: "map",
                        name: "Section",
                        properties: {
                            title: {
                                dataType: "string",
                                name: "Section Title",
                                validation: { required: true }
                            },
                            content: {
                                dataType: "string",
                                name: "Section Content",
                                markdown: true
                            },
                            image: {
                                dataType: "string",
                                name: "Section Image",
                                storage: {
                                    storagePath: "page_sections/images",
                                    acceptedFiles: ["image/*"]
                                }
                            },
                            link: {
                                dataType: "string",
                                name: "Section Link",
                                url: true
                            }
                        }
                    },
                    image: {
                        dataType: "string",
                        name: "Image",
                        storage: {
                            storagePath: "page_sections/images",
                            acceptedFiles: ["image/*"]
                        }
                    },
                    slider: {
                        dataType: "array",
                        name: "Slider",
                        of: {
                            dataType: "map",
                            properties: {
                                title: {
                                    dataType: "string",
                                    name: "Title",
                                    validation: { required: true }
                                },
                                image: {
                                    dataType: "string",
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
            dataType: "map",
            name: "Sidebar",
            properties: {
                title: {
                    dataType: "string",
                    name: "Sidebar Title",
                    validation: { required: false }
                },
                content: {
                    dataType: "string",
                    name: "Sidebar Content",
                    markdown: true
                }
            }
        },
        seo_metadata: {
            dataType: "map",
            name: "SEO Metadata",
            properties: {
                meta_title: {
                    dataType: "string",
                    name: "Meta Title"
                },
                meta_description: {
                    dataType: "string",
                    name: "Meta Description"
                },
                focus_keywords: {
                    dataType: "array",
                    name: "Focus Keywords",
                    of: {
                        dataType: "string"
                    }
                }
            }
        },
        footer_override: {
            dataType: "string",
            name: "Footer Override",
            markdown: true
        },
        publish_date: {
            dataType: "date",
            name: "Publish Date",
            validation: { required: true }
        },
        last_updated: {
            dataType: "date",
            name: "Last Updated",
            autoValue: "on_update"
        },
        is_published: {
            dataType: "boolean",
            name: "Is Published",
            columnWidth: 100,
            description: "Should this page be live on the site?"
        }
    }
};
