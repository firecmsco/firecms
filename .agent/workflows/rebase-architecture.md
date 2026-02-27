---
description: Rebase architecture rules and package entry points
---
# Rebase Architecture and UX Rules

When working on the Rebase / FireCMS project, adhere to the following architectural guidelines:

## 1. Entry Points
- **Primary End-User Entry**: The entry point for the application as an end-user is the `app` folder at the root of the project (`/Users/francesco/firecms_v4/app`). This is how users consume and run the CMS.
- **Legacy Modules**: The `packages/firecms_cloud` package is maintained for legacy reasons and is **not** the main entry point for the Rebase project.

## 2. Dev Mode & End-User Preview
- **Dev Mode Toggle**: The application uses `AdminModeController` with states `developer` and `editor`. This toggle must be preserved.
- **End-User Preview**: Toggling to Editor Mode is explicitly designed so the developer can see the app exactly as an end-user would see it, without any developer-specific UI elements.
- **Effective Role Simulation**: Use an `EffectiveRoleController` context to simulate different user roles. When in Dev Mode, developers can select an "effective role" to accurately preview what that specific role can see/execute when toggling to Editor Mode.

## 3. Package Management
- **Do not rename packages**: Existing packages (like `firecms_core`, `firecms_cloud`, `postgresql`, etc.) should keep their current names instead of being renamed to `rebase_*`.
- **Inner View Adaptability**: Internal views should conditionally render inline developer actions (like "Edit Schema") by checking if `mode === "developer"`.

Adhere to these rules when building features or refactoring packages for Rebase.
