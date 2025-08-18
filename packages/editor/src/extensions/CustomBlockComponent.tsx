import { CommandProps, mergeAttributes, Node, NodeViewProps, RawCommands, textblockTypeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

// Define the interface for the user-defined component props
export type CustomBlockComponentProps = NodeViewProps;

export interface CustomBlockOptions {
    // The React component provided by the user
    component: React.ComponentType<CustomBlockComponentProps> | null;
    // Delimiter used to identify the custom block in markdown
    delimiter?: string;
}

const DEFAULT_DELIMITER = "```custom";

export const CustomBlock = Node.create<CustomBlockOptions>({
    name: "customBlock",
    group: "block",
    content: "text*",
    isolating: true,
    priority: 1000,

    addOptions() {
        return {
            // The custom component must be provided when configuring the extension
            component: null,
            delimiter: DEFAULT_DELIMITER
        };
    },

    addAttributes() {
        return {
            content: {
                default: ""
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[data-type=\"custom-block\"]",
                getAttrs: (element) => {
                    const content = (element as HTMLElement).getAttribute("data-content") || "";
                    return { content };
                }
            }
        ];
    },

    renderHTML({
                   node,
                   HTMLAttributes
               }) {
        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                "data-type": "custom-block",
                "data-content": node.attrs.content
            }),
            0
        ];
    },

    addNodeView() {
        const { component } = this.options;
        if (!component) {
            throw new Error("You must provide a React component via the `component` option.");
        }
        return ReactNodeViewRenderer(component);
    },

    addCommands() {
        return {
            setCustomBlock:
                (attributes?: Record<string, any>) =>
                    ({ commands }: CommandProps) => {
                        return commands.setNode(this.name, attributes);
                    },
            toggleCustomBlock:
                (attributes?: Record<string, any>) =>
                    ({ commands }: CommandProps) => {
                        return commands.toggleNode(this.name, "paragraph", attributes);
                    }
        } as Partial<RawCommands>;
    },

    // Define input rules to recognize the custom delimiter
    addInputRules() {
        const { delimiter } = this.options;
        if (!delimiter) {
            throw new Error("You must provide a delimiter via the `delimiter` option.");
        }
        const escapedDelimiter = delimiter.replace(/`/g, "\\`");
        const customBlockInputRegex = new RegExp(`^${escapedDelimiter}[\\s\\n]$`);

        return [
            textblockTypeInputRule({
                find: customBlockInputRegex,
                type: this.type,
                getAttributes: () => {
                    return {};
                }
            })
        ];
    },

    addStorage() {
        return {
            markdown: {
                serialize: (state: any, node: ProseMirrorNode) => {
                    const { delimiter } = this.options;
                    state.write(`${delimiter}\n`);
                    if (node.attrs.content) {
                        state.write(node.attrs.content);
                    } else {
                        state.renderContent(node);
                    }
                    state.ensureNewLine();
                    state.write("```");
                    state.closeBlock(node);
                },
                parse: {
                    setup: (markdownit: any) => {
                        // Add the custom plugin to markdown-it
                        markdownit.use(customBlockPlugin);
                    },
                    // Map the custom token to the node
                    tokenSpec: {
                        custom_block: {
                            block: this.name,
                            getAttrs: (token: any) => {
                                return { content: token.content };
                            }
                        }
                    }
                }
            }
        };
    }
});

// Create a markdown-it plugin to handle custom blocks
function customBlockPlugin(md: any) {
    // Add a function to parse custom code fences
    function customBlock(state: any, startLine: number, endLine: number, silent: boolean) {

        let pos = state.bMarks[startLine] + state.tShift[startLine];
        let max = state.eMarks[startLine];

        // Check if the line starts with ```
        if (state.src.charCodeAt(pos) !== 0x60 /* ` */) {
            return false;
        }

        let mem = pos;
        pos = state.skipChars(pos, 0x60 /* ` */);

        const len = pos - mem;

        if (len < 3) {
            return false;
        }

        const marker = state.src.slice(mem, pos);
        const params = state.src.slice(pos, max);

        if (params.trim() !== "custom") {
            return false;
        }

        // Search for end of code fence
        let nextLine = startLine;

        while (nextLine < endLine) {
            nextLine++;
            pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];

            if (pos < max && state.src.charCodeAt(pos) !== 0x60 /* ` */) {
                continue;
            }

            pos = state.skipChars(pos, 0x60 /* ` */);

            if (pos - mem < len) {
                continue;
            }

            pos = state.skipSpaces(pos);

            if (pos < max) {
                continue;
            }

            // Found the closing fence
            const token = state.push("custom_block", "", 0);
            token.content = state.getLines(startLine + 1, nextLine, state.tShift[startLine], true);
            token.map = [startLine, nextLine];
            state.line = nextLine + 1;
            return true;
        }

        return false;
    }

    // Add the rule to the parser
    md.block.ruler.before("fence", "custom_block", customBlock, {
        alt: ["paragraph", "reference", "blockquote", "list"]
    });
}
