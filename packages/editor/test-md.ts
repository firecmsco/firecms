import markdownIt from "markdown-it";
import type { Token } from "markdown-it/lib/index.js";
import type { StateCore } from "markdown-it/lib/rules_core/state_core.js";

const md = markdownIt({ html: false });

md.core.ruler.after("inline", "image-to-block", (state: StateCore) => {
    const tokens = state.tokens;
    for (let i = 1; i < tokens.length - 1; i++) {
        if (
            tokens[i - 1].type === "paragraph_open" &&
            tokens[i].type === "inline" &&
            tokens[i + 1].type === "paragraph_close"
        ) {
            const inlineTokens = tokens[i].children || [];

            // Check if it's ONLY an image (ignoring spaces/softbreaks?)
            if (inlineTokens.length === 1 && inlineTokens[0].type === "image") {
                state.tokens.splice(i - 1, 3, inlineTokens[0]);
                i -= 2; // Adjust index to continue loop correctly
            }
        }
    }
});

console.log(md.parse("![alt](src.jpg)").map(t => t.type));
console.log(md.parse("Some text ![alt](src.jpg) and more").map((t: Token) => t.type));
