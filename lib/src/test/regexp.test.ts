import { isValidRegExp, serializeRegExp } from "../core/util/regexp";

it("Serialize", () => {
    expect(serializeRegExp(/\d.*/)).toEqual("/\\d.*/");
    expect(serializeRegExp(/\d.*/g)).toEqual("/\\d.*/g");
});


it("Validate", () => {
    expect(isValidRegExp("\\d.*")).toEqual(false);
    expect(isValidRegExp("/\\d.*/g")).toEqual(true);
});
