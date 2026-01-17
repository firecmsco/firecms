import { prettifyIdentifier } from "../src/util/strings";

describe("prettifyIdentifier", () => {
    it("should return empty string for empty input", () => {
        expect(prettifyIdentifier("")).toBe("");
    });

    it("should handle camelCase", () => {
        expect(prettifyIdentifier("displayName")).toBe("Display Name");
        expect(prettifyIdentifier("firstName")).toBe("First Name");
        expect(prettifyIdentifier("lastName")).toBe("Last Name");
        expect(prettifyIdentifier("emailAddress")).toBe("Email Address");
    });

    it("should handle PascalCase", () => {
        expect(prettifyIdentifier("DisplayName")).toBe("Display Name");
        expect(prettifyIdentifier("FirstName")).toBe("First Name");
        expect(prettifyIdentifier("UserProfile")).toBe("User Profile");
    });

    it("should handle snake_case", () => {
        expect(prettifyIdentifier("display_name")).toBe("Display Name");
        expect(prettifyIdentifier("first_name")).toBe("First Name");
        expect(prettifyIdentifier("user_profile")).toBe("User Profile");
    });

    it("should handle kebab-case", () => {
        expect(prettifyIdentifier("display-name")).toBe("Display Name");
        expect(prettifyIdentifier("first-name")).toBe("First Name");
        expect(prettifyIdentifier("user-profile")).toBe("User Profile");
    });

    it("should handle mixed separators", () => {
        expect(prettifyIdentifier("display_name-test")).toBe("Display Name Test");
        expect(prettifyIdentifier("first-name_last")).toBe("First Name Last");
    });

    it("should handle acronyms correctly", () => {
        expect(prettifyIdentifier("imageURL")).toBe("Image URL");
        expect(prettifyIdentifier("XMLParser")).toBe("XML Parser");
        expect(prettifyIdentifier("HTTPSConnection")).toBe("HTTPS Connection");
        expect(prettifyIdentifier("parseHTML")).toBe("Parse HTML");
    });

    it("should handle consecutive uppercase letters", () => {
        expect(prettifyIdentifier("URLParser")).toBe("URL Parser");
        expect(prettifyIdentifier("HTMLElement")).toBe("HTML Element");
        expect(prettifyIdentifier("APIKey")).toBe("API Key");
    });

    it("should handle single words", () => {
        expect(prettifyIdentifier("name")).toBe("Name");
        expect(prettifyIdentifier("title")).toBe("Title");
        expect(prettifyIdentifier("description")).toBe("Description");
    });

    it("should handle all uppercase", () => {
        expect(prettifyIdentifier("NAME")).toBe("NAME");
        expect(prettifyIdentifier("TITLE")).toBe("TITLE");
    });

    it("should handle all lowercase", () => {
        expect(prettifyIdentifier("name")).toBe("Name");
        expect(prettifyIdentifier("title")).toBe("Title");
    });

    it("should handle multiple consecutive separators", () => {
        expect(prettifyIdentifier("display__name")).toBe("Display Name");
        expect(prettifyIdentifier("first--name")).toBe("First Name");
        expect(prettifyIdentifier("user___profile")).toBe("User Profile");
    });

    it("should trim whitespace", () => {
        expect(prettifyIdentifier("  displayName  ")).toBe("Display Name");
        expect(prettifyIdentifier(" first_name ")).toBe("First Name");
    });

    it("should handle numbers", () => {
        expect(prettifyIdentifier("user123")).toBe("User123");
        expect(prettifyIdentifier("item1Name")).toBe("Item1Name");
        expect(prettifyIdentifier("version2Point0")).toBe("Version2Point0");
    });

    it("should handle complex combinations", () => {
        expect(prettifyIdentifier("userProfileURLParser")).toBe("User Profile URL Parser");
        expect(prettifyIdentifier("parse_HTML_document")).toBe("Parse HTML Document");
        expect(prettifyIdentifier("API-key-validator")).toBe("API Key Validator");
    });

    it("should handle edge cases with underscores and hyphens at boundaries", () => {
        expect(prettifyIdentifier("_displayName")).toBe("Display Name");
        expect(prettifyIdentifier("displayName_")).toBe("Display Name");
        expect(prettifyIdentifier("-displayName-")).toBe("Display Name");
    });

    it("should handle already formatted strings", () => {
        expect(prettifyIdentifier("Display Name")).toBe("Display Name");
        expect(prettifyIdentifier("First Name")).toBe("First Name");
    });
});

