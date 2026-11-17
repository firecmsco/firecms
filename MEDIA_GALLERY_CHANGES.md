# Media gallery changes

This document describes the current local changes for issue #409 and the related example setup. These changes have not been deployed or committed.

## Media selection and catalog

- Added an optional media picker context in `packages/firecms_core/src/contexts/MediaPickerContext.tsx`. The Media Manager plugin provides it; applications without the plugin retain the existing upload field.
- Added a **Choose from library** action to storage fields. Single fields replace their value; array fields append unique values. Existing paths, download URLs, and bucket-qualified values follow the field's configuration. MIME restrictions still apply; the upload size limit does not exclude files already in the library.
- Uploads through storage fields register metadata in the configured media collection, `media_assets` by default. A failed metadata write is reported while the already uploaded file remains available to the field.
- The picker loads catalog entries in pages and loads previews independently so one slow preview does not block the entire list. The Media Library view also uses pages; its text filter applies only to loaded files.
- Media Manager uploads use unique file names to reduce accidental overwrites. Deleting a file from the library warns that records referencing it may break. Removing an image from a field does not delete its Storage object.
- Added helper functions for matching file types, merging selected values, registering metadata, and resolving previews.

## Firebase and example

- The example enables `@firecms/media_manager` and resolves it to workspace source in Vite. React Router dependencies are deduplicated to avoid a split router context.
- The example reads its Firebase web configuration from `examples/example/src/firebase_config.ts`; project-specific values were removed and replaced with placeholders. Emulator connection code and temporary emulator configuration were removed after local testing.
- The Firebase Storage adapter uses the default Storage instance when an explicit bucket matches the app's default bucket, and includes the bucket in its download URL cache key. This fixes a local-emulator preview problem and avoids mixing URLs from different buckets.
- Added `compressorjs` as an explicit Media Manager dependency. The lockfile also contains dependency-resolution changes that were already present before this feature work, alongside changes caused by linking the Media Manager and its dependency.
- Added a Formex `prepublishOnly` build hook while investigating the original install failure. Building Formex manually resolved the missing declaration errors, but the hook has not been verified with a clean install. Schema inference also required a manual build in that session.

## Verification performed

- The media picker, metadata registration, preview loading, and default-bucket regression suites passed: 4 suites and 9 tests at the time of the last combined run. The picker test was subsequently expanded; rerun the suites after further changes.
- Type checks passed for the example and Media Manager after the respective changes.
- A local Firebase emulator test uploaded a file, created two records referencing it, deleted one record, and verified that the file and other record remained. This exercised Firebase services directly, not the complete FireCMS UI.
- A local-emulator image preview was resolved and downloaded through the Firebase Storage adapter.
- The browser picker and previews were manually exercised by the user. There is no automated end-to-end browser test for the complete upload, selection, save, and deletion flow.

## Limitations and follow-up

- Files uploaded outside FireCMS, or before catalog registration was enabled, are not automatically indexed. Import and reconciliation remain future work.
- The gallery does not track every record using an asset. Explicitly deleting a file from the library can break existing references; automatic shared-file cleanup is not implemented.
- The Storage upload adapter's existing five-second no-progress timeout can report a misleading CORS message. The previously configured live bucket endpoint returned 404 during investigation; its Storage setup was not changed.
- Production Firebase authentication, Firestore permissions, Storage permissions, and uploads have not been validated.
- `examples/example/firestore-debug.log` is an untracked local emulator log, not feature source code.

Suggested branch: `feat/media-library-file-reuse`

Suggested commit: `feat: allow reusing files from media library`
