/**
 * Recursively makes all properties optional.
 * Used to type partial translation overrides.
 */
export type DeepPartial<T> = T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/**
 * All user-visible strings used internally by @rebasepro/core.
 * Pass a `DeepPartial<RebaseTranslations>` via the `translations` prop
 * on your Rebase entry-point component to override any key, or to add
 * a new locale.
 *
 * @group Core
 */
export interface RebaseTranslations {
    // ─── Form actions ────────────────────────────────────────────
    save: string;
    create: string;
    /** Used when duplicating an existing entity */
    create_copy: string;
    save_and_close: string;
    create_copy_and_close: string;
    create_and_close: string;
    /** Discard changes on an existing entity */
    discard: string;
    /** Clear a new/copy form (not yet persisted) */
    clear: string;
    cancel: string;

    // ─── Entity actions ──────────────────────────────────────────
    edit: string;
    copy: string;
    delete: string;
    delete_not_allowed: string;

    // ─── Delete dialog ───────────────────────────────────────────
    delete_confirmation_title: string;
    delete_confirmation_body: string;
    delete_multiple_confirmation_body: string;

    // ─── Unsaved-changes dialog ───────────────────────────────────
    unsaved_changes_title: string;
    unsaved_changes_body: string;
    discard_changes: string;
    keep_editing: string;

    // ─── Collection table / toolbar ──────────────────────────────
    search: string;
    find_by_id: string;
    find_entity_by_id: string;
    filter: string;
    clear_filter: string;
    clear_filter_sort: string;
    clear_sort: string;
    no_items: string;
    no_entries_found: string;
    all_entries_loaded: string;
    create_your_first_entry: string;
    no_results_filter_sort: string;
    add: string;
    remove: string;
    copy_id: string;
    add_specific: string;
    select_specific: string;
    select_from: string;
    done: string;
    log_out: string;
    column_cannot_be_edited: string;
    close: string;
    unsaved_local_changes: string;
    unsaved_local_changes_description: string;
    preview_changes: string;
    apply_changes: string;
    discard_local_changes: string;
    preview_local_changes: string;
    preview_local_changes_description: string;
    type: string;
    string: string;
    number: string;
    boolean: string;
    date: string;
    map: string;
    array: string;
    arrays_of_arrays_not_supported: string;
    data_type_not_supported: string;
    browser_does_not_support_audio: string;
    user_not_found: string;

    // ─── Collection view actions ──────────────────────────────────
    /** "Delete" action on collections, may require permissions check */
    delete_selected: string;
    cannot_delete_selected: string;

    // ─── Array / field containers ─────────────────────────────────
    /** Label for buttons that add a new item to a list */
    add_entry: string;
    add_on_top: string;
    add_below: string;
    /** Label when a fieldName is provided — "Add to {fieldName}" */
    add_to_field: string;
    /** Placeholder for the 'value' input in a KeyValue field */
    value: string;
    /** Placeholder for the 'key' input in a KeyValue field */
    key: string;
    /** Drag and drop help text for multiple files */
    drag_drop_multiple: string;
    /** Drag and drop help text for a single file */
    drag_drop_single: string;

    // ─── Navigation / scaffold ────────────────────────────────────
    open_menu: string;
    close_drawer: string;
    navigation_drawer: string;
    collapse: string;
    expand: string;

    // ─── Error states ─────────────────────────────────────────────
    error: string;
    error_uploading_file: string;
    error_deleting: string;
    error_before_delete: string;
    error_firestore_index: string;
    create_index: string;
    value_is_not_reference: string;
    click_to_edit: string;
    data_is_not_array_of_references: string;
    collection_does_not_exist: string;

    // ─── Misc ─────────────────────────────────────────────────────
    loading: string;
    local_changes_applied: string;
    local_changes_discarded: string;
    open_in_console: string;
    see_console_details: string;
    drop_here_create_group: string;
    filter_for_null_values: string;
    value_updated_elsewhere: string;
    add_property: string;
    edit_name: string;
    this_entity_not_exist: string;
    internal_error: string;
    /** Shown in unsaved-changes dialogs */
    are_you_sure_leave: string;
    passkey_error_unsupported: string;

    admin: string;
    home: string;
    this_form_has_errors: string;
    error_loading_navigation: string;
    error_loading_auth: string;
    this_form_has_been_modified: string;
    current_form_in_sync: string;
    unexpected_value: string;
    unexpected_value_click_to_edit: string;
    unexpected_reference_value: string;
    copy_url_to_clipboard: string;
    open_image_in_new_tab: string;
    reference_not_set: string;
    reference_does_not_exist: string;
    entity_not_found: string;
    file_not_found: string;
    unsaved_changes_in_entity: string;
    delete_this_role: string;
    no_roles_yet: string;
    create_default_roles: string;
    delete_role_confirmation: string;
    delete_this_user: string;
    no_users_yet: string;
    add_logged_user_as_admin: string;
    add_current_user_as_admin: string;
    create_default_roles_and_add_admin: string;
    delete_user_confirmation: string;
    create_your_users_and_roles: string;
    no_users_or_roles_defined: string;
    save_before_changing_schema: string;
    edit_schema_for_this_form: string;
    no_permissions_to_edit_collection: string;

    // ─── Rename group dialog ──────────────────────────────────────
    rename_group: string;
    group_name_label: string;
    group_name_empty_error: string;
    group_name_exists_error: string;

    // ─── Search ───────────────────────────────────────────────────
    search_collections: string;

    // ─── Navigation groups ────────────────────────────────────────
    /** Default group name shown when collections/views have no explicit group */
    views_group: string;

    // ─── Entity Edit View ─────────────────────────────────────────
    youd_need_to_save_before_additional_collections: string;

    // ─── Not Found Page ───────────────────────────────────────────
    page_not_found: string;
    page_not_found_body: string;
    back_to_home: string;

    // ─── Collection Editor ─────────────────────────────────────────
    default_collection_view: string;
    table_view: string;
    cards_view: string;
    kanban_view: string;
    choose_how_entities_displayed_default: string;

    document_view: string;
    side_panel: string;
    full_screen: string;
    should_documents_opened_full_screen: string;

    select_custom_view: string;
    no_custom_views_defined: string;
    select_custom_action: string;
    no_custom_actions_defined: string;

    no_collections_found: string;
    start_building_collections: string;
    create_first_collection: string;
    define_collections_programmatically: string;

    edit_collection: string;
    no_permissions_edit_collection: string;
    no_permissions_create_collection: string;
    create_collection: string;
    update_collection: string;

    new_collection: string;
    add_new_collection: string;
    collection_with_name: string;
    change_icon: string;
    is_subcollection_of: string;
    name: string;
    collection_name_description: string;
    path: string;
    relative_path_to_parent: string;
    path_in_database: string;
    singular_name: string;
    singular_name_description: string;
    description: string;
    description_of_collection: string;
    collection_id: string;
    collection_id_description: string;
    collection_group: string;
    collection_group_description: string;
    advanced_settings: string;
    doc_history_global: string;
    doc_history_enabled: string;
    doc_history_not_enabled: string;
    doc_history_description: string;
    document_id_generation: string;
    code_defined: string;
    users_must_define_id: string;
    users_can_define_id: string;
    doc_id_auto_generated: string;
    config_doc_id_generation: string;
    enable_text_search: string;
    text_search_description: string;
    database_id: string;
    default_text: string;

    custom_actions: string;
    more_info: string;
    define_custom_actions_cli: string;
    action_defined_in_code: string;
    add_custom_entity_action: string;
    remove_this_action: string;
    remove_action_warning: string;

    subcollections_of: string;
    add_subcollection: string;
    custom_views: string;
    define_custom_views_cli: string;
    view_defined_in_code: string;
    add_custom_entity_view: string;
    delete_this_subcollection: string;
    remove_collection_warning: string;
    remove_this_view: string;
    remove_view_warning: string;

    no_collection_selected: string;
    code_for_collection: string;
    use_config_define_json: string;
    customise_collection_code: string;
    copied: string;

    property_cant_be_edited: string;
    property_not_editable_description: string;
    delete_this_property: string;
    delete_property_warning: string;
    error_must_specify_id: string;
    error_id_format: string;
    error_id_already_exists: string;
    error_must_specify_title: string;
    custom_or_other: string;
    select_property_widget: string;
    error_changing_data_type: string;
    required: string;

    enum_form_dialog: string;
    imported_data_preview: string;
    entities_with_same_id_overwritten: string;
    collection_editor: string;
    properties_in_this_group: string;
    data_property_mapping: string;
    property_edit_view: string;
    all_of_these: string;
    any_of_these: string;

    only_admins_edit_roles: string;
    error_user_not_found: string;
    role: string;
    name_of_this_role: string;
    id_of_this_role: string;
    create_entities: string;
    read_entities: string;
    update_entities: string;
    delete_entities: string;
    all_collections: string;
    create_entities_in_collections: string;
    access_all_data_in_every_collection: string;
    update_data_in_any_collection: string;
    delete_data_in_any_collection: string;
    allow_all_permissions_in_this_collections: string;
    all: string;
    customise_permissions_description: string;
    create_collections: string;
    yes: string;
    no: string;
    can_user_create_collections: string;
    edit_collections: string;
    only_own_collections: string;
    own: string;
    can_user_edit_collections: string;
    delete_collections: string;
    can_user_delete_collections: string;
    error_saving_role: string;
    create_role: string;
    update: string;

    only_admins_change_roles: string;
    must_be_at_least_one_admin: string;
    logged_user_not_found: string;
    user: string;
    user_id: string;
    error_updating_asset: string;
    error_deleting_asset: string;
    name_of_this_user: string;
    email_of_this_user: string;
    roles: string;
    create_user: string;

    filters: string;
    multiple_entities: string;
    unsaved_changes: string;
    so_empty: string;
    no_results: string;
    refresh_data: string;
    dark_mode: string;
    light_mode: string;
    system_mode: string;
    ok: string;
    save_collection_config: string;
    search_for_more_icons: string;
    ai_modified: string;
    size_label: string;
    group_by: string;
    initialize_kanban_order: string;

    users: string;
    add_user: string;
    add_role: string;
    is_admin: string;
    default_permissions: string;
    created_on: string;
    email: string;
    id: string;
    read: string;

    // data import
    column_in_file: string;
    map_to_property: string;
    default_values: string;
    default_values_description: string;
    property: string;
    default_value: string;
    autogenerate_id: string;
    id_column_description: string;
    do_not_set_value: string;
    set_value_to_true: string;
    set_value_to_false: string;
    drag_and_drop_file: string;
    error_saving_data: string;
    retry: string;
    saving_data: string;
    entities_saved: string;
    do_not_close_tab: string;
    import: string;
    import_data: string;
    upload_file_description: string;
    back: string;
    next: string;
    save_data: string;
    use_column_as_id: string;
    do_not_import_property: string;
    entities_will_be_overwritten: string;
    data_imported_successfully: string;

    // data export
    export: string;
    export_data: string;
    download_table_csv: string;
    csv: string;
    json: string;
    dates_as_timestamps: string;
    dates_as_strings: string;
    flatten_arrays: string;
    download: string;
    large_number_of_documents: string;
    include_undefined_values: string;
    submit: string;

    no_filterable_properties: string;
    apply_filters: string;
    list: string;
    cards: string;
    board: string;
    initialize_kanban_order_desc: string;
    kanban_view_not_available: string;
    kanban_view_requires_enum: string;
    no_enum_values_configured: string;
    items_need_backfill: string;
    initialize: string;
    confirm_multiple_delete: string;
    delete_entity_confirm_title: string;

    no_filter: string;
    is_true: string;
    is_false: string;
    error_uploading_file_size: string;
    error_uploading_file_type: string;
    drag_drop_files: string;
    drag_drop_file: string;

    multiple_deleted: string;
    some_entities_deleted: string;
    error_deleting_entities: string;
    deleted: string;

    select_reference: string;
    select_references: string;
    account_settings: string;
    profile: string;
    sessions: string;
    display_name: string;
    photo_url: string;
    save_profile: string;
    saving: string;
    no_active_sessions: string;
    revoking: string;
    revoke_all_sessions: string;
    unknown_device: string;
    current: string;
    role_id: string;
    role_name: string;
    add_reference: string;
    add_reference_to: string;

    /** RolesView — table & permissions */
    role_deleted_successfully: string;
    error_deleting_role: string;
    collection_permissions: string;
    collection: string;
    no_collections_configured: string;
    no_security_rules_defined: string;
    no_rules: string;

    /** UsersView — snackbar */
    bootstrap_admin_success: string;
    failed_to_bootstrap_admin: string;
    user_deleted_successfully: string;
    error_deleting_user: string;

    /** Editor table-bubble */
    add_row_before: string;
    add_row_after: string;
    delete_row: string;
    add_column_before: string;
    add_column_after: string;
    delete_column: string;
    delete_table: string;

    /** Editor image-bubble */
    alt_text: string;
    title: string;

    /** MapFieldBinding */
    a_property_of_this_map_has_error: string;

    /** AI Collection Generator Popover */
    generate_collection_with_ai: string;
    modify_collection_with_ai: string;
    describe_collection_to_create: string;
    describe_changes_to_make: string;
    ai_placeholder_create: string;
    ai_placeholder_modify: string;
    ai_assist: string;
    generating: string;

    /** Recently extracted strings for collection editor */
    this_is_subcollection_of: string;
    use_existing_paths_database: string;
    describe_collection_ai: string;
    generate_with_ai: string;
    create_from_json_config: string;
    paste_json_config: string;
    create_collection_from_file_formats: string;
    select_template: string;
    products: string;
    collection_products_subtitle: string;
    collection_users_subtitle: string;
    blog_posts: string;
    collection_blog_posts_subtitle: string;
    pages: string;
    collection_pages_subtitle: string;
    continue_from_scratch: string;

    /** Admin views config */
    cms_users: string;
    roles_menu: string;
    project_settings: string;

    // ─── Auth ────────────────────────────────────────────────────
    by_signing_in_you_agree_to_our: string;
    terms_and_conditions: string;
    and_our: string;
    privacy_policy: string;
    email_password: string;
    sign_in_with_google: string;

    // --- Auth error messages ---
    auth_user_not_found: string;
    auth_wrong_password: string;
    auth_user_disabled: string;
    auth_account_exists_with_different_credential: string;
    auth_email_already_in_use: string;
    auth_google_permissions_required: string;
    auth_invalid_email_password: string;
    auth_enter_email_first: string;
    auth_password_reset_sent: string;
    auth_sign_in_account: string;
    auth_create_new_account: string;
    auth_password: string;
    auth_reset_password: string;
    auth_new_user: string;
    auth_have_account: string;
    auth_sign_in: string;
    auth_sign_up: string;

    auto_setup_collections_button: string;
    auto_setup_collections_title: string;
    auto_setup_collections_desc: string;
    this_can_take_a_minute: string;
    no_collections_found_to_setup: string;
    collections_have_been_setup: string;
    error_setting_up_collections: string;

    // --- Home ---
    add_your: string;
    database_collections: string;
    no_unmapped_collections: string;
    query_and_update_with_datatalk: string;

    // --- Welcome ---
    welcome_to_rebase: string;
    admin_panel_ready_bring_data: string;
    admin_panel_ready_get_started: string;
    auto_detect_collections: string;
    auto_detect_collections_desc: string;
    create_a_collection: string;
    create_collection_desc: string;
    read_the_docs: string;
    read_the_docs_desc: string;
    explore_docs: string;
    want_to_customize_with_code: string;
    to_scaffold_a_local_project: string;

    // ─── Collection Editor — Validation ──────────────────────────
    validation: string;
    unique: string;
    required_message: string;
    required_tooltip: string;
    unique_tooltip: string;
    lowercase: string;
    uppercase: string;
    trim: string;
    exact_length: string;
    min_length: string;
    max_length: string;
    matches_regex: string;
    not_valid_regexp: string;
    regex_helper: string;
    min_value: string;
    max_value: string;
    less_than: string;
    more_than: string;
    positive_value: string;
    negative_value: string;
    integer_value: string;

    // ─── Collection Editor — Property Edit ───────────────────────
    invalid_regular_expression: string;
    must_specify_target_collection: string;
    need_specify_repeat_field: string;
    need_specify_block_properties: string;
    incomplete_condition: string;
    field_name: string;

    // ─── Collection Editor — Display & Config ────────────────────
    kanban_column_property: string;
    select_a_property: string;
    kanban_property_not_found: string;
    no_enum_string_properties: string;
    kanban_column_description: string;
    create_property: string;
    order_property: string;
    order_property_not_found: string;
    no_number_properties: string;
    order_property_description: string;
    display_settings: string;
    default_row_size: string;
    side_dialog_width: string;
    side_dialog_width_description: string;
    inline_editing_enabled: string;
    inline_editing_disabled: string;
    inline_editing_description: string;
    include_json_view: string;
    no_json_view: string;
    json_view_description: string;
    not_found_suffix: string;

    // ─── Editor ─────────────────────────────────────────────────
    editor_text: string;
    editor_text_description: string;
    editor_heading_1: string;
    editor_heading_1_description: string;
    editor_heading_2: string;
    editor_heading_2_description: string;
    editor_heading_3: string;
    editor_heading_3_description: string;
    editor_todo_list: string;
    editor_todo_list_description: string;
    editor_bullet_list: string;
    editor_bullet_list_description: string;
    editor_numbered_list: string;
    editor_numbered_list_description: string;
    editor_quote: string;
    editor_quote_description: string;
    editor_code: string;
    editor_code_description: string;
    editor_image: string;
    editor_image_description: string;
    editor_multiple: string;
    editor_link: string;
    editor_save: string;
    editor_cancel: string;
    editor_remove_link: string;
    editor_paste_or_type_link: string;
    editor_open_in_new_window: string;
    editor_bold: string;
    editor_italic: string;
    editor_underline: string;
    editor_strikethrough: string;
    editor_autocomplete: string;
    editor_autocomplete_description: string;

    // ─── Text Search Dialog ─────────────────────────────────────
    text_search_dialog_title: string;
    text_search_local_not_recommended: string;
    text_search_local_fetch_warning: string;
    text_search_external_suggestion: string;
    text_search_local_description: string;
    text_search_own_implementation: string;
    text_search_enable_for_collection: string;
    text_search_enable_for_project: string;
    text_search_enabled_snackbar: string;

    // ─── Settings ────────────────────────────────────────────────
    settings_heading: string;
    settings_project_name: string;
    settings_default_language: string;
    settings_default_language_caption: string;
    settings_enable_local_text_search: string;
    settings_local_text_search_caption: string;
    settings_doc_history_all_collections: string;
    settings_doc_history_caption: string;
    settings_theme: string;
    settings_primary_color: string;
    settings_secondary_color: string;
    settings_sample_theme_components: string;
    settings_drag_drop_logo: string;
    settings_security_rules: string;
    settings_security_rules_description: string;
    settings_security_rules_add_domain: string;
    settings_security_rules_caption: string;

    // ─── Studio: SQL Editor ─────────────────────────────────────
    studio_sql_executing_query: string;
    studio_sql_query_error: string;
    studio_sql_run_query_placeholder: string;
    studio_sql_visual_execution_plan: string;
    studio_sql_success: string;
    studio_sql_no_results: string;
    studio_sql_rows: string;
    studio_sql_time: string;
    studio_sql_copy_markdown: string;
    studio_sql_export_json: string;
    studio_sql_export_csv: string;
    studio_sql_format_sql: string;
    studio_sql_explain: string;
    studio_sql_limit_1000: string;
    studio_sql_remove_from_favorites: string;
    studio_sql_add_to_favorites: string;
    studio_sql_save: string;
    studio_sql_run: string;
    studio_sql_database: string;
    studio_sql_role: string;
    studio_sql_admin: string;
    studio_sql_select_db: string;
    studio_sql_query_results: string;
    studio_sql_save_snippet: string;
    studio_sql_snippet_name: string;
    studio_sql_snippet_name_placeholder: string;
    studio_sql_snippet_saved_local: string;
    studio_sql_cancel: string;
    studio_sql_dangerous_operation: string;
    studio_sql_dangerous_operation_body: string;
    studio_sql_snippet_saved: string;
    studio_sql_markdown_copied: string;
    studio_sql_markdown_copy_failed: string;
    studio_sql_row_updated: string;
    studio_sql_cannot_edit_missing_query: string;
    studio_sql_cannot_resolve_table: string;
    studio_sql_missing_pk: string;
    studio_sql_update_failed: string;
    studio_sql_execution_not_supported: string;
    studio_sql_error_executing: string;
    studio_sql_error_explaining: string;
    studio_sql_save_first_to_favorite: string;
    studio_sql_cms: string;
    studio_sql_cms_collections_tooltip: string;
    studio_sql_edit_entity: string;
    studio_sql_sql_not_supported: string;
    studio_sql_fetch_error: string;
    studio_sql_unexpected_format: string;
    studio_sql_no_tables: string;
    studio_sql_schema_fetch_error: string;

    // ─── Studio: SQL Editor Sidebar ──────────────────────────────
    studio_sql_sidebar_snippets: string;
    studio_sql_sidebar_history: string;
    studio_sql_sidebar_schema: string;
    studio_sql_sidebar_no_snippets: string;
    studio_sql_sidebar_save_snippet_hint: string;
    studio_sql_sidebar_no_history: string;
    studio_sql_sidebar_history_hint: string;
    studio_sql_sidebar_delete_snippet: string;

    // ─── Studio: Schema Browser ──────────────────────────────────
    studio_schema_tables: string;
    studio_schema_loading: string;
    studio_schema_no_tables: string;
    studio_schema_retry: string;
    studio_schema_primary_key: string;
    studio_schema_select_all: string;
    studio_schema_insert_into: string;
    studio_schema_update: string;
    studio_schema_delete_from: string;
    studio_schema_columns: string;

    // ─── Studio: RLS Editor ──────────────────────────────────────
    studio_rls_title: string;
    studio_rls_description: string;
    studio_rls_enabled: string;
    studio_rls_disabled: string;
    studio_rls_no_rls: string;
    studio_rls_enable_rls: string;
    studio_rls_disable_rls: string;
    studio_rls_create_policy: string;
    studio_rls_policies: string;
    studio_rls_no_policies: string;
    studio_rls_no_policies_desc: string;
    studio_rls_add_first_policy: string;
    studio_rls_force_rls: string;
    studio_rls_force_rls_desc: string;
    studio_rls_enable_force_rls: string;
    studio_rls_disable_force_rls: string;
    studio_rls_edit: string;
    studio_rls_delete: string;
    studio_rls_confirm_delete_title: string;
    studio_rls_confirm_delete_body: string;
    studio_rls_confirm_enable_title: string;
    studio_rls_confirm_enable_body: string;
    studio_rls_confirm_disable_title: string;
    studio_rls_confirm_disable_body: string;
    studio_rls_select_table: string;
    studio_rls_no_tables: string;
    studio_rls_error: string;
    studio_rls_retry: string;
    studio_rls_loading: string;

    // ─── Studio: Policy Editor ───────────────────────────────────
    studio_policy_edit: string;
    studio_policy_create: string;
    studio_policy_defining_rules: string;
    studio_policy_cancel: string;
    studio_policy_save: string;
    studio_policy_template: string;
    studio_policy_select_template: string;
    studio_policy_name: string;
    studio_policy_name_placeholder: string;
    studio_policy_behavior: string;
    studio_policy_permissive: string;
    studio_policy_permissive_desc: string;
    studio_policy_restrictive: string;
    studio_policy_restrictive_desc: string;
    studio_policy_command: string;
    studio_policy_target_roles: string;
    studio_policy_roles_placeholder: string;
    studio_policy_using_expr: string;
    studio_policy_using_expr_desc: string;
    studio_policy_check_expr: string;
    studio_policy_check_expr_desc: string;
    studio_policy_help_title: string;
    studio_policy_help_intro: string;
    studio_policy_help_step1_title: string;
    studio_policy_help_step1_desc: string;
    studio_policy_help_step2_title: string;
    studio_policy_help_step2_desc: string;
    studio_policy_help_role_public: string;
    studio_policy_help_role_authenticated: string;
    studio_policy_help_role_anon: string;
    studio_policy_help_step3_title: string;
    studio_policy_help_step3_desc: string;
    studio_policy_help_step3_example: string;
    studio_policy_help_step4_title: string;
    studio_policy_help_step4_desc: string;
    studio_policy_help_step4_example: string;
    studio_policy_help_auth_vars_title: string;
    studio_policy_help_auth_vars_desc: string;
    studio_policy_help_auth_uid: string;
    studio_policy_help_auth_jwt: string;
    studio_policy_help_auth_roles: string;
    studio_policy_help_docs_cta: string;
    studio_policy_help_read_docs: string;
    studio_policy_help_got_it: string;

    // ─── Studio: UI Actions ──────────────────────────────────────
    studio_add_kanban_column: string;
    studio_add_kanban_column_title: string;
    studio_add_kanban_column_name: string;
    studio_add_kanban_column_name_placeholder: string;
    studio_add_kanban_column_add: string;
    studio_add_kanban_column_cancel: string;
    studio_collection_view_sql: string;
    studio_collection_view_cms: string;
    studio_editor_collection_tooltip: string;
    studio_editor_collection_no_permission: string;
    studio_editor_collection_start_tooltip: string;
    studio_editor_collection_start_no_permission: string;
    studio_editor_collection_start_copied: string;
    studio_editor_entity_tooltip: string;
    studio_editor_entity_no_permission: string;
    studio_home_edit_collection: string;
    studio_home_delete_collection: string;
    studio_home_confirm_delete_title: string;
    studio_home_confirm_delete_body: string;
    studio_kanban_setup: string;
    studio_missing_reference: string;
    studio_missing_reference_create: string;
    studio_new_collection: string;
    studio_new_collection_card: string;
    studio_new_collection_no_permission: string;
    studio_property_add_column: string;
    studio_property_add_column_no_permission: string;
    studio_add_kanban_column_desc: string;
    studio_add_kanban_column_adding: string;
    studio_collection_view_edit: string;
    studio_editor_collection_disabled: string;
    studio_editor_collection_edit: string;
    studio_editor_entity_save_first: string;
    studio_editor_entity_edit_schema: string;
    studio_editor_collection_start_save_filter: string;
    studio_editor_collection_start_clear_filter: string;
    studio_editor_collection_start_reset_filter: string;
    studio_editor_collection_start_saved: string;
    studio_home_duplicate_collection: string;
    studio_home_delete: string;
    studio_home_confirm_delete_no_data: string;
    studio_home_collection_deleted: string;
    studio_kanban_configure: string;
    studio_missing_reference_error: string;
    studio_new_collection_add: string;
}
