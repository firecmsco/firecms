// prismHighlight.js
import Prism from "prismjs";
// Import the JSX syntax definition (also includes JavaScript syntax).
// import prismjs from "prismjs/components/prism-jsx";
import PrismJsx from 'prismjs/components/prism-jsx.js';

import fs from "fs";

const proExampleCode = `
    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });`;


function generate() {

    // Highlight code as JSX
    const highlightedCode = Prism.highlight(
        proExampleCode,
        Prism.languages.jsx,
        "jsx"
    );

    // Write the resulting HTML (containing <span> tags with Prism classes) to a file
    fs.writeFileSync('highlighted_code.html', highlightedCode, 'utf8');
    console.log(highlightedCode);
}

generate();
