import {
    buildCollection,
    buildProperties,
    buildProperty,
    Permissions
} from "@firecms/core";
import {
    getExtendedCountryNameFromLocale,
    getIso2FromLocale
} from "../locales";
import { contentCategories } from "./content";

interface ShortActionContent {
    key: string,
    type: string,
    icon: string,
    cta: string,
    url?: string,
    nav?: boolean,
    screen?: string
    message?: string,
    number?: string,
    breathing_exercise?: string,
    relaxation?: string,
    podcast?: string,
    podcast_category?: string,
    visibility: string[],
}

interface ShortAction {
    active: boolean,
    content: ShortActionContent[],
    screen_view: string,
    goal: string
}

export const shortActionEntry = buildProperty(({ propertyValue }) => {

    const type = propertyValue?.type === "type";

    const getProperties = (value : string) => {

        switch (value) {
            case "url":
                return buildProperties({
                    url: {
                        dataType: "string",
                        name: "URL",
                    },
                    nav: {
                        dataType: "boolean",
                        name: "Show navigation buttons"
                    }
                })
            case "screen":
                return buildProperties({
                    screen: {
                        dataType: "string",
                        name: "App Route Name",
                        enumValues: {
                            "/main": "Main",
                            "/forgotten_password": "Forgotten Password",
                            "update_health_status": "Update Health Status",
                            "exercise_overview": "Exercise Overview",
                            "meditation_overview": "Meditation Overview",
                            "yourhealth_yourareas": "Your body Areas",
                            "yourhealth_personaldetails": "Personal Details",
                            "yourhealth_goals": "Your Goals",
                            "yourhealth_injuries": "Your Injuries",
                            "yourhealth_past_injuries": "Your Past Injuries",
                            "yourhealth_surgeries": "Your Surgeries",
                            "yourhealth_personal": "Your Personal Details",
                            "yourhealth_sport_activities": "Your Sport Activities",
                            "delete_account": "Delete Account",
                            "profile_notifications": "Notifications",
                            "profile_weeklygoal" : "Weekly Goal",
                            "profile_account": "Account",
                            "profile_subscription" : "Subscription",
                            "user_report_pdf" : "User Report PDF",
                        }
                    }
                })
            case "chat":
                return null
            case "chat_message":
                return buildProperties({
                    message: {
                        dataType: "string",
                        name: "Message"
                    }
                })
            case "call":
                return buildProperties({
                    number: {
                        dataType: "string",
                        name: "Number"
                    }
                })
            case "breathing_exercise":
                return buildProperties({
                    breathing_exercise: {
                        dataType: "reference",
                        path: "breathing_exercises",
                        name: "Breathing exercise"
                    }
                })
            case "relaxation":
                return buildProperties({
                    relaxation: {
                        dataType: "reference",
                        path: "content/de-DE/meditations",
                        name: "Relaxation"
                    }
                })
            case "podcast":
                return buildProperties({
                    podcast: {
                        dataType: "reference",
                        path: "content/de-DE/podcasts",
                        name: "Podcast",

                    }
                })
            case "podcast_category":
                return buildProperties({
                    podcast_category: {
                        dataType: "string",
                        name: "Podcast Category",
                        enumValues: contentCategories
                    }})
            default:
                return null
        }
    }

    return ({
        dataType: "map",
        name: "Short action",
        expanded: true,
        properties: {
            key: {
                dataType: "string",
                name: "Key",
                description: "Unique key for this action (Analytics purpose)"
            },
            type: {
                dataType: "string",
                name: "Action type",
                enumValues: {
                    url: "Visit URL",
                    screen: "Go to Screen",
                    chat: "Open Chat",
                    chat_message: "Open Chat with Message",
                    call: "Call a number",
                    breathing_exercise: "Breathing Exercise",
                    relaxation: "Relaxation Exercise",
                    update_pain: "Update Pain Areas",
                    podcast: "Play Podcast",
                    podcast_category: "Open Podcast Category"
                }
            },
            icon: {
                dataType: "string",
                name: "Icon",
                enumValues: {
                    health_status_icon: "Health Status Icon",
                    knowledge_icon: "Knowledge Icon",
                    support_icon: "Support Icon",
                    profile_icon: "Profile Icon",
                    today_icon: "Today Icon",
                    exercise_icon: "Exercise Icon",
                    relaxation_icon: "Relaxation Icon",
                    breathing_icon: "Breathing Icon",
                }
            },
            cta: {
                dataType: "string",
                name: "Call to action"
            },
            visibility: {
                name: "Visibility",
                dataType: "array",
                of: {
                    dataType: "string",
                    enumValues: {
                        "always": "Always",
                        "after_training": "After training",
                        "before_training": "Before training",
                    }
                },
                defaultValue: ["always"]
            },
            ...getProperties(propertyValue?.type),
        }
    });
})

export const shortActionsCollection = (locale: string) => {

    const shortActionEntry = buildProperty(({ propertyValue, }) => {

        const type = propertyValue?.type === "type";

        const getProperties = (value : string) => {

            switch (value) {
                case "url":
                    return buildProperties({
                        url: {
                            dataType: "string",
                            name: "URL",
                        },
                        nav: {
                            dataType: "boolean",
                            name: "Show navigation buttons"
                        }
                    })
                case "screen":
                    return buildProperties({
                        screen: {
                            dataType: "string",
                            name: "App Route Name",
                            enumValues: {
                                "/main": "Main",
                                "/forgotten_password": "Forgotten Password",
                                "update_health_status": "Update Health Status",
                                "exercise_overview": "Exercise Overview",
                                "meditation_overview": "Meditation Overview",
                                "yourhealth_yourareas": "Your body Areas",
                                "yourhealth_personaldetails": "Personal Details",
                                "yourhealth_goals": "Your Goals",
                                "yourhealth_injuries": "Your Injuries",
                                "yourhealth_past_injuries": "Your Past Injuries",
                                "yourhealth_surgeries": "Your Surgeries",
                                "yourhealth_personal": "Your Personal Details",
                                "yourhealth_sport_activities": "Your Sport Activities",
                                "delete_account": "Delete Account",
                                "profile_notifications": "Notifications",
                                "profile_weeklygoal" : "Weekly Goal",
                                "profile_account": "Account",
                                "profile_subscription" : "Subscription",
                                "user_report_pdf" : "User Report PDF",
                            }
                        }
                    })
                case "chat":
                    return null
                case "chat_message":
                    return buildProperties({
                        message: {
                            dataType: "string",
                            name: "Message"
                        }
                    })
                case "call":
                    return buildProperties({
                        number: {
                            dataType: "string",
                            name: "Number"
                        }
                    })
                case "breathing_exercise":
                    return buildProperties({
                        breathing_exercise: {
                            dataType: "reference",
                            path: "breathing_exercises",
                            name: "Breathing exercise"
                        }
                    })
                case "relaxation":
                    return buildProperties({
                        relaxation: {
                            dataType: "reference",
                            path: "content/"+locale+"/meditations",
                            name: "Relaxation"
                        }
                    })
                case "podcast":
                    return buildProperties({
                        podcast: {
                            dataType: "reference",
                            path: "content/"+locale+"/podcasts",
                            name: "Podcast",

                        }
                    })
                case "podcast_category":
                    return buildProperties({
                        podcast_category: {
                            dataType: "string",
                            name: "Podcast Category",
                            enumValues: contentCategories
                        },
                        podcast_category_ref: {
                            dataType: "reference",
                            name: "Podcast Category",
                            path: "content/"+locale+"/categories"
                        }
                    })
                default:
                    return null
            }
        }

        return ({
            dataType: "map",
            name: "Short action",
            expanded: true,
            properties: {
                key: {
                    dataType: "string",
                    name: "Key",
                    description: "Unique key for this action (Analytics purpose)"
                },
                type: {
                    dataType: "string",
                    name: "Action type",
                    enumValues: {
                        url: "Visit URL",
                        screen: "Go to Screen",
                        chat: "Open Chat",
                        chat_message: "Open Chat with Message",
                        call: "Call a number",
                        breathing_exercise: "Breathing Exercise",
                        relaxation: "Relaxation Exercise",
                        update_pain: "Update Pain Areas",
                        podcast: "Play Podcast",
                        podcast_category: "Open Podcast Category"
                    }
                },
                icon: {
                    dataType: "string",
                    name: "Icon",
                    enumValues: {
                        health_status_icon: "Health Status Icon",
                        knowledge_icon: "Knowledge Icon",
                        support_icon: "Support Icon",
                        profile_icon: "Profile Icon",
                        today_icon: "Today Icon",
                        exercise_icon: "Exercise Icon",
                        relaxation_icon: "Relaxation Icon",
                        breathing_icon: "Breathing Icon",
                    }
                },
                cta: {
                    dataType: "string",
                    name: "Call to action"
                },
                visibility: {
                    name: "Visibility",
                    dataType: "array",
                    of: {
                        dataType: "string",
                        enumValues: {
                            "always": "Always",
                            "after_training": "After training",
                            "before_training": "Before training",
                        }
                    },
                    defaultValue: ["always"]
                },
                ...getProperties(propertyValue?.type),
            }
        });
    })

    return buildCollection<ShortAction>({
        id: "content_short_actions",
        name: "Short Actions"+" - "+getIso2FromLocale(locale).toUpperCase(),
        icon: "Apps",
        path: `content/${locale}/short_actions`,
        group: `Content - ${getExtendedCountryNameFromLocale(locale)}`,
        properties: {
            goal: {
                name: "Goal",
                dataType: "string",
                enumValues: {
                    pain_relief: "Pain Relief",
                    prevention: "Prevention",
                }
            },
            active: {
                dataType: "boolean",
                name: "Active",
                defaultValue: true
            },
            screen_view: {
                name: "Screen View",
                dataType: "string",
                enumValues: {
                    today: "Today",
                    health_center: "Health Center",
                    profile: "Profile",
                    exercise_done: "Exercise Done",
                }
            },
            content: {
                name: "Content",
                dataType: "array",
                of: shortActionEntry
            },
        }
    })

}
