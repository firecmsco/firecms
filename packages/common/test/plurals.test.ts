import { plural, singular } from "../src/util/plurals";

describe("plurals utils", () => {
    describe("plural", () => {
        it("should return the original word if amount is 1", () => {
            expect(plural("apple", 1)).toBe("apple");
            expect(plural("dog", 1)).toBe("dog");
        });

        it("should pluralize regular words", () => {
            expect(plural("apple")).toBe("apples");
            expect(plural("dog", 2)).toBe("dogs");
            expect(plural("bus")).toBe("buses");
            expect(plural("quiz")).toBe("quizzes");
        });

        it("should pluralize words ending in 'y'", () => {
            expect(plural("city")).toBe("cities");
            expect(plural("puppy")).toBe("puppies");
            expect(plural("boy")).toBe("boys");
            expect(plural("day")).toBe("days");
        });

        it("should handle irregular nouns", () => {
            expect(plural("child")).toBe("children");
            expect(plural("person")).toBe("people");
            expect(plural("man")).toBe("men");
            expect(plural("goose")).toBe("geese");
            expect(plural("tooth")).toBe("teeth");
            expect(plural("foot")).toBe("feet");
            expect(plural("mouse")).toBe("mice");
        });

        it("should handle uncountable nouns", () => {
            expect(plural("sheep")).toBe("sheep");
            expect(plural("fish")).toBe("fish");
            expect(plural("information")).toBe("information");
            expect(plural("money")).toBe("money");
            expect(plural("aircraft")).toBe("aircraft");
        });

        it("should handle Latin/Greek suffixes", () => {
            expect(plural("matrix")).toBe("matrices");
            expect(plural("index")).toBe("indices");
            expect(plural("datum")).toBe("data");
            expect(plural("octopus")).toBe("octopi");
            expect(plural("analysis")).toBe("analyses");
            expect(plural("basis")).toBe("bases");
        });

        it("should handle f / fe / lf endings", () => {
            expect(plural("wolf")).toBe("wolves");
            expect(plural("leaf")).toBe("leaves");
            expect(plural("knife")).toBe("knives");
            expect(plural("life")).toBe("lives");
            expect(plural("thief")).toBe("thieves");
        });
        
        it("should handle o endings", () => {
            expect(plural("tomato")).toBe("tomatoes");
            expect(plural("potato")).toBe("potatoes");
            expect(plural("hero")).toBe("heroes");
        });
    });

    describe("singular", () => {
        it("should return the original word if amount is NOT 1", () => {
            expect(singular("apples", 2)).toBe("apples");
            expect(singular("dogs", 0)).toBe("dogs");
        });

        it("should singularize regular words", () => {
            expect(singular("apples")).toBe("apple");
            expect(singular("dogs")).toBe("dog");
            expect(singular("buses")).toBe("bus");
            expect(singular("quizzes")).toBe("quiz");
        });

        it("should singularize words ending in 'ies/ys'", () => {
            expect(singular("cities")).toBe("city");
            expect(singular("puppies")).toBe("puppy");
            expect(singular("boys")).toBe("boy");
        });

        it("should handle irregular nouns", () => {
            expect(singular("children")).toBe("child");
            expect(singular("people")).toBe("person");
            expect(singular("men")).toBe("man");
            expect(singular("geese")).toBe("goose");
            expect(singular("teeth")).toBe("tooth");
            expect(singular("feet")).toBe("foot");
            expect(singular("mice")).toBe("mouse");
        });

        it("should handle uncountable nouns", () => {
            expect(singular("sheep")).toBe("sheep");
            expect(singular("fish")).toBe("fish");
            expect(singular("information")).toBe("information");
            expect(singular("money")).toBe("money");
        });

        it("should handle Latin/Greek suffixes from plurals", () => {
            expect(singular("matrices")).toBe("matrix");
            expect(singular("indices")).toBe("index");
            expect(singular("data")).toBe("datum");
            expect(singular("octopi")).toBe("octopus");
            expect(singular("analyses")).toBe("analysis");
        });

        it("should handle ves endings", () => {
            expect(singular("wolves")).toBe("wolf");
            expect(singular("leaves")).toBe("leaf");
            expect(singular("knives")).toBe("knife");
            expect(singular("lives")).toBe("life");
            expect(singular("thieves")).toBe("thief");
        });

        it("should handle oes endings", () => {
            expect(singular("tomatoes")).toBe("tomato");
            expect(singular("potatoes")).toBe("potato");
            expect(singular("heroes")).toBe("hero");
        });
    });
});
