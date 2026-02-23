/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module 'virtual:firecms-collections' {
    export const collections: import("@firecms/core").EntityCollection[];
}
