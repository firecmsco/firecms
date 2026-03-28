const markdownIt = require("markdown-it");

const md = markdownIt({ html: false });

md.core.ruler.after("inline", "tables-wrap-paragraphs", (state) => {
    const tokens = state.tokens;
    for (let i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].type === "td_open" || tokens[i].type === "th_open") {
            let closeIndex = i + 1;
            while (closeIndex < tokens.length && tokens[closeIndex].type !== "td_close" && tokens[closeIndex].type !== "th_close") {
                closeIndex++;
            }
            if (closeIndex < tokens.length) {
                const pOpen = new state.Token("paragraph_open", "p", 1);
                pOpen.block = true;
                const pClose = new state.Token("paragraph_close", "p", -1);
                pClose.block = true;
                
                state.tokens.splice(closeIndex, 0, pClose);
                state.tokens.splice(i + 1, 0, pOpen);
            }
        }
    }
});

const text = `| a | b |\n|---|---|\n| c | d |`;
const tokens = md.parse(text, {});
console.log(tokens.map(t => t.type));
