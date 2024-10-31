import { buildCollection, Permissions } from "@firecms/core";


export function buildSurveysCollection() {

    return buildCollection<any>({
        id: "surveys",
        path: "surveys",
        name: "Surveys",
        singularName: "Survey",
        properties: {
            company_token_batch: {
                name: "Company token batch id",
                description: "Company token batch id got from medicalmotion's admin",
                validation: { required: true },
                dataType: "number"
            },
            mandatory: {
                name: "Mandatory",
                validation: { required: true },
                dataType: "boolean"
            },
            survey_key: {
                name: "The key of the survey",
                dataType: "string",
                validation: { required: true }
            },
            days_after_first_activity: {
                name: "Days after first activity",
                dataType: "number",
                validation: { required: true }
            }
        }
    });
}

