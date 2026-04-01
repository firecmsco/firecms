/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module 'virtual:rebase-collections' {
    export const collections: import("@rebasepro/core").EntityCollection[];
}
