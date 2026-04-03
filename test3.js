const { Project, SyntaxKind } = require("ts-morph");
const project = new Project();
const sourceFile = project.createSourceFile("users.ts", `
export default {
    securityRules: [
        { name: "test", operation: "read" }
    ]
};
`);
const varDecl = sourceFile.getDefaultExportSymbol().getDeclarations()[0].asKind(SyntaxKind.ExportAssignment).getExpression();
const prop = varDecl.getProperty("securityRules");
prop.setInitializer("[]");
const fs = require("fs");
fs.writeFileSync("/tmp/out3.txt", sourceFile.getText());
