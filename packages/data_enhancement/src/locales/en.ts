export const dataEnhancementTranslationsEn = {
    autofill: "Autofill",
    autofill_current_content: "Autofill based on current content",
    set_id_first: "You must set an ID first",
    provide_instructions: "Provide instructions to Data Enhancement",
    fill_missing_fields: "Fill missing fields",
    translate_missing_content: "Translate missing content",
    add_2_paragraphs_to: "Add 2 paragraphs to the content",
    use_openai_generate_content: "Use Google Vertex AI or OpenAI to generate content automatically.",
    autofill_this_field: "Autofill this field",
    autofill_property: "Autofill property",
    input_data_before_enhancing: "Input some data before enhancing",
    input_data_before_enhancing_property: "You need to input some data in other properties before enhancing this one.",
    based_on_rest_of_entity: "Based on the rest of the entity",
    this_field: "this field",
    subscription_needed: "A valid subscription is needed in order to use this function.",
    login_to_enhance: "You need to be logged in to enhance data",
    no_fields_updated: "No fields were updated",
    ask_ai_to_write: "Ask AI to write",
    instructions: "Instructions"
};

declare module "@firecms/core" {
    export interface FireCMSTranslations {
        autofill?: string;
        autofill_current_content?: string;
        set_id_first?: string;
        provide_instructions?: string;
        fill_missing_fields?: string;
        translate_missing_content?: string;
        add_2_paragraphs_to?: string;
        use_openai_generate_content?: string;
        autofill_this_field?: string;
        autofill_property?: string;
        input_data_before_enhancing?: string;
        input_data_before_enhancing_property?: string;
        based_on_rest_of_entity?: string;
        this_field?: string;
        subscription_needed?: string;
        login_to_enhance?: string;
        no_fields_updated?: string;
        ask_ai_to_write?: string;
        instructions?: string;
    }
}
