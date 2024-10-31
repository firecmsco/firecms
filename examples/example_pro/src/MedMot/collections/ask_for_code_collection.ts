import { buildCollection, buildProperty, EntityReference, EnumValues, Permissions } from "@firecms/core"

export type AskForCode = {
    email: string,
    created_at: Date,
    insurance: EntityReference,
    status: string,
    source: string,
    pathname: string,
    where_know: string,
    about_you: string,
    where_know_message: string,
    about_you_message: string,
    code_sent: string,
    notes: string,
}


const AskForCodeStatus: EnumValues = {
    new: "New",
    contacted: "Contacted",
    refused: "Refused",
    spam: "Spam",
    signed_up: "Signed up",
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

export function askForCodeSchemas() {
    return buildCollection<AskForCode>({
        name: "Ask For code",
        id: "ask_for_code",
        path: "ask_for_code",
        textSearchEnabled: true,
        exportable: true,
        group: "Marketing",
        defaultSize: "m",
        initialSort: ["created_at", "desc"],
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
                autoValue: "on_create",

            }),
            status: {
                dataType: "string",
                name: 'Status',
                enumValues: AskForCodeStatus
            },
            insurance: {
                dataType: "reference",
                readOnly: true,
                name: 'Insurance',
                path: "insurances"
            },
            source: {
                dataType: "string",
                readOnly: true,
                name: 'Source',
            },
            pathname: {
                dataType: "string",
                readOnly: true,
                name: 'Pathname',
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
