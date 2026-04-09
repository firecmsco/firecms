import { toKebabCase, toSnakeCase, randomString, randomColor, slugify, unslugify, prettifyIdentifier } from "../src/strings";

describe("strings utils", () => {
    describe("toKebabCase", () => {
        it("should convert to kebab case", () => {
            expect(toKebabCase("helloWorld")).toBe("hello-world");
            expect(toKebabCase("Hello_World")).toBe("hello-world");
            expect(toKebabCase("fooBarBaz")).toBe("foo-bar-baz");
            expect(toKebabCase("")).toBe("");
        });
    });

    describe("toSnakeCase", () => {
        it("should convert to snake case", () => {
            expect(toSnakeCase("helloWorld")).toBe("hello_world");
            expect(toSnakeCase("Hello-World")).toBe("hello_world");
            expect(toSnakeCase("fooBarBaz")).toBe("foo_bar_baz");
            expect(toSnakeCase("")).toBe("");
        });
    });

    describe("randomString", () => {
        it("should generate random string of given length", () => {
            const str1 = randomString(5);
            expect(str1.length).toBe(5);
            
            const str2 = randomString(10);
            expect(str2.length).toBe(10);

            expect(str1).not.toBe(str2);
        });
    });

    describe("randomColor", () => {
        it("should generate random hex color", () => {
            const tempMathRandom = Math.random;
            Math.random = jest.fn(() => 0.5);
            
            const color = randomColor();
            expect(color).toBe("7fffff");
            
            Math.random = tempMathRandom;
        });
    });

    describe("slugify", () => {
        it("should convert text to slug", () => {
            expect(slugify("Hello World!")).toBe("hello_world");
            expect(slugify("Hello World!", "-")).toBe("hello-world");
            expect(slugify("Hello World!", "_", false)).toBe("Hello_World");
            expect(slugify("ãàáäâẽèéëê", "-")).toBe("aaaaaeeeee");
            expect(slugify("foo & bar")).toBe("foo_bar");
            expect(slugify("  whitespaces  ")).toBe("whitespaces");
            expect(slugify("")).toBe("");
            expect(slugify(undefined)).toBe("");
        });
    });

    describe("unslugify", () => {
        it("should convert slug to normal text", () => {
            expect(unslugify("hello-world")).toBe("Hello World");
            expect(unslugify("hello_world")).toBe("Hello World");
            expect(unslugify("hello_world_test")).toBe("Hello World Test");
            expect(unslugify("already normal")).toBe("already normal");
            expect(unslugify("")).toBe("");
            expect(unslugify(undefined)).toBe("");
        });
    });

    describe("prettifyIdentifier", () => {
        it("should format identifier nicely", () => {
            expect(prettifyIdentifier("imageURL")).toBe("Image URL");
            expect(prettifyIdentifier("XMLParser")).toBe("XML Parser");
            expect(prettifyIdentifier("hello_world")).toBe("Hello World");
            expect(prettifyIdentifier("hello-world")).toBe("Hello World");
            expect(prettifyIdentifier("CamelCaseTested")).toBe("Camel Case Tested");
            expect(prettifyIdentifier("")).toBe("");
        });
    });
});
