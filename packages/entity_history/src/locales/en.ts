export const entityHistoryTranslationsEn = {
    history: "History",
    entity_history_only_existing: "History is only available for existing entities",
    entity_history_reverted: "Reverted version",
    entity_history_error_reverting: "Error reverting entity",
    entity_history_no_history: "No history available",
    entity_history_when_save: "When you save an entity, a new version is created and stored in the history.",
    entity_history_revert_tooltip: "Revert to this version",
    entity_history_please_save: "Please save or discard your changes before reverting",
    loading_more: "Loading more...",
    entity_history_no_more: "No more history available",
    entity_history_revert_dialog_title: "Revert data to this version?",
    entity_history_previous_value: "Previous value",
    entity_history_see_details: "See details for this revision",
    entity_history_just_now: "just now",
    entity_history_minutes_ago: "{{minutes}}m ago",
    entity_history_hours_ago: "{{hours}}h ago",
    entity_history_days_ago: "{{days}}d ago",
    user_picture: "User picture"
};

declare module "@firecms/core" {
    export interface FireCMSTranslations {
        history?: string;
        entity_history_only_existing?: string;
        entity_history_reverted?: string;
        entity_history_error_reverting?: string;
        entity_history_no_history?: string;
        entity_history_when_save?: string;
        entity_history_revert_tooltip?: string;
        entity_history_please_save?: string;
        loading_more?: string;
        entity_history_no_more?: string;
        entity_history_revert_dialog_title?: string;
        entity_history_previous_value?: string;
        entity_history_see_details?: string;
        entity_history_just_now?: string;
        entity_history_minutes_ago?: string;
        entity_history_hours_ago?: string;
        entity_history_days_ago?: string;
        user_picture?: string;
    }
}
