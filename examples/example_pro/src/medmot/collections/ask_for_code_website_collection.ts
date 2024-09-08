import { buildCollection, buildProperty, EntityReference, EnumValues, Permissions } from "@firecms/core"

export type AskForCodeWebsite = {
    email: string,
    created_at: Date,
    insurance: EntityReference,
    status: string,
    where_know: string,
    about_you: string,
    where_know_message: string,
    about_you_message: string,
    code_sent: string,
    notes: string,
}


const AskForCodeWebsiteStatus: EnumValues = {
    new: "New",
    contacted: "Contacted",
    refused: "Refused",
    spam: "Spam"
};

const WhereKnowMM: EnumValues = {
    insurance: "Health insurance",
    social_media: "Social media (ex. linkedin, instagram)",
    internet: "Internet (ex. articles, blog)",
    health_professional: "Medical professionals",
    friends: "Friends",
    other: "Other"
};

const WhatPurpose: EnumValues = {
    treat_pain: "Treat my pain",
    prevention: "Improve health",
    professional: "Professional Health Sector",
    researcher: "Researcher Health market",
    investor: "Investor",
    worker_health_insurance: "Worker Health Insurance",
    other: "Other"
};

export function askForCodeWebsiteSchemas() {
    return buildCollection<AskForCodeWebsite>({
        name: "Ask For code Website",
        id: "ask_for_code_website",
        path: "ask_for_code_website",
        textSearchEnabled: true,
        exportable: true,
        group: "Marketing",
        defaultSize: "m",
        customId: false,
        properties: {
            email: {
                dataType: "string",
                name: 'Email',
                readOnly: true
            },
            created_at: buildProperty({
                dataType: "date",
                name: "Created At",
                autoValue: "on_create"
            }),
            status: {
                dataType: "string",
                name: 'Status',
                enumValues: AskForCodeWebsiteStatus
            },
            insurance: {
                dataType: "reference",
                readOnly: true,
                name: 'Insurance',
                path: "insurances"
            },
            where_know: {
                dataType: "string",
                readOnly: true,
                name: 'How know medicalmotion',
                enumValues: WhereKnowMM
            },
            where_know_message: {
                dataType: "string",
                description: "If the user choosed \"other\" will need to explain further",
                name: 'How know medicalmotion (msg)',
                readOnly: true
            },
            about_you: {
                dataType: "string",
                readOnly: true,
                name: 'Why interested?',
                enumValues: WhatPurpose
            },
            about_you_message: {
                dataType: "string",
                readOnly: true,
                description: "If the user choosed \"other\" will need to explain further",
                name: 'Why interested? (msg)'
            },
            code_sent: {
                dataType: "string",
                readOnly: true,
                name: 'Token sent',
            },
            notes: {
                dataType: "string",
                name: 'Notes'
            },
        }
    });
}
