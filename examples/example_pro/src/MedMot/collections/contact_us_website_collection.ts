import { buildCollection, buildProperty, EntityReference, EnumValues, Permissions } from "@firecms/core"

export type ContactUsWebsite = {
    email: string,
    created_at: Date,
    phone_number: string,
    status: string,
    how_help: string,
    what_to_do: string,
    code_sent: string,
    notes: string,
}

const ContactUsWhatToDo: EnumValues = {
    "try_mm": "Request a demo and try medicalmotion",
    "partnership": "Talk to a team member about a partnership",
    "technical": "Talk to a team member about a technical issue",
    "additional_information": "Request additional information about medicalmotion",
    "additional_information_research": "Request additional information for my research or studies",
    "other": "Other"
}

const ContactUsWebsiteStatus: EnumValues = {
    new: "New",
    contacted: "Contacted",
    refused: "Refused",
    spam: "Spam"
};

export function contactUsWebsiteSchemas() {
    return buildCollection<ContactUsWebsite>({
        name: "Contact Us Website",
        id: "contact_us_website",
        path: "contact_us_website",
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
                enumValues: ContactUsWebsiteStatus
            },
            what_to_do: {
                dataType: "string",
                readOnly: true,
                name: 'What would you like to do?',
                enumValues: ContactUsWhatToDo
            },
            how_help: {
                dataType: "string",
                name: 'How can we help',
                readOnly: true
            },
            phone_number: {
                dataType: "string",
                name: 'Phone number',
                readOnly: true
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
