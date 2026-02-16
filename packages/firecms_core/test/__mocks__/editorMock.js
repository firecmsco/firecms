// Mock for @firecms/editor to avoid ESM issues in Jest tests
module.exports = {
    Editor: () => null,
    EditorContent: () => null,
    useEditor: () => ({}),
    // Add any other exports as needed
};
