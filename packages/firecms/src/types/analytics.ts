export type CMSAnalyticsEvent =
    | "entity_click"
    | "entity_click_from_reference"

    | "reference_selection_clear"
    | "reference_selection_toggle"
    | "reference_selected_single"
    | "reference_selection_new_entity"

    | "edit_entity_clicked"
    | "entity_edited"
    | "new_entity_click"
    | "new_entity_saved"
    | "copy_entity_click"
    | "entity_copied"

    | "single_delete_dialog_open"
    | "multiple_delete_dialog_open"
    | "single_entity_deleted"
    | "multiple_entities_deleted"

    | "drawer_navigate_to_home"
    | "drawer_navigate_to_collection"
    | "drawer_navigate_to_view"

    | "home_navigate_to_collection"
    | "home_favorite_navigate_to_collection"
    | "home_navigate_to_view"
    | "home_favorite_navigate_to_view"

    | "collection_inline_editing"

    | "unmapped_event"
    ;
