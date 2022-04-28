import {
    hydrateRegExp,
    isValidRegExp,
    serializeRegExp
} from "../core/util/regexp";

it("Serialize", () => {
    expect(serializeRegExp(/\d.*/)).toEqual("/\\d.*/");
    expect(serializeRegExp(/\d.*/g)).toEqual("/\\d.*/g");
});
it("Deserialize", () => {
    expect(hydrateRegExp("\d.*")).toEqual(undefined);
    expect(hydrateRegExp("/\\d.*/")).toEqual(/\d.*/);
    expect(hydrateRegExp("/\\d.*/g")).toEqual(/\d.*/g);
});

it("Validate", () => {
    expect(isValidRegExp("\\d.*")).toEqual(false);
    expect(isValidRegExp("/\\d.*/g")).toEqual(true);
});
