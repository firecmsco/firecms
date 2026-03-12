export const mediaManagerTranslationsEn = {
    media_library: "Media Library",
    media_library_description: "Manage images and files",
    media_search_assets: "Search assets...",
    media_grid_view: "Grid view",
    media_list_view: "List view",
    media_refresh: "Refresh",
    media_upload: "Upload",
    media_error_loading: "Error loading assets: {{message}}",
    media_try_again: "Try Again",
    media_no_assets: "No media assets yet",
    media_upload_first_file: "Upload your first file",
    media_asset_updated: "Asset updated successfully",
    media_error_updating: "Error updating asset: {{message}}",
    media_asset_deleted: "Asset deleted successfully",
    media_error_deleting: "Error deleting asset: {{message}}",
    media_error_getting_url: "Error getting download URL",
    media_preview_not_available: "Preview not available",
    media_dimensions: "Dimensions",
    media_size: "Size",
    media_type: "Type",
    media_created: "Created",
    media_file_name: "File Name",
    media_title: "Title",
    media_alt_text: "Alt Text",
    media_recommended_seo: "Recommended for SEO",
    media_caption: "Caption",
    media_tags: "Tags",
    media_add_tag: "Add a tag...",
    media_add: "Add",
    media_save_changes: "Save Changes",
    media_delete_asset: "Delete Asset?",
    media_delete_confirmation: "Are you sure you want to delete \"{{name}}\"? This action cannot be undone.",
    media_file_too_large: "{{name}}: File too large (max {{size}})",
    media_file_type_not_allowed: "{{name}}: File type not allowed",
    media_upload_failed: "Upload failed",
    media_upload_files: "Upload Files",
    media_drop_files: "Drop files here or click to browse",
    media_max_file_size: "Maximum file size: {{size}}",
    media_selected_files_count: "Selected files ({{count}})",
    media_remove: "Remove",
    media_uploading: "Uploading...",
    media_manage_description: "Manage your media files and assets",
    media_assets_count: "{{count}} assets"
};

declare module "@firecms/core" {
    export interface FireCMSTranslations {
        media_library?: string;
        media_library_description?: string;
        media_search_assets?: string;
        media_grid_view?: string;
        media_list_view?: string;
        media_refresh?: string;
        media_upload?: string;
        media_error_loading?: string;
        media_try_again?: string;
        media_no_assets?: string;
        media_upload_first_file?: string;
        media_asset_updated?: string;
        media_error_updating?: string;
        media_asset_deleted?: string;
        media_error_deleting?: string;
        media_error_getting_url?: string;
        media_preview_not_available?: string;
        media_dimensions?: string;
        media_size?: string;
        media_type?: string;
        media_created?: string;
        media_file_name?: string;
        media_title?: string;
        media_alt_text?: string;
        media_recommended_seo?: string;
        media_caption?: string;
        media_tags?: string;
        media_add_tag?: string;
        media_add?: string;
        media_save_changes?: string;
        media_delete_asset?: string;
        media_delete_confirmation?: string;
        media_file_too_large?: string;
        media_file_type_not_allowed?: string;
        media_upload_failed?: string;
        media_upload_files?: string;
        media_drop_files?: string;
        media_max_file_size?: string;
        media_selected_files_count?: string;
        media_remove?: string;
        media_uploading?: string;
        media_manage_description?: string;
        media_assets_count?: string;
    }
}
