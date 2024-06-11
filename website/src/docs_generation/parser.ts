export type OnFileParsed = (filename: string, content: string) => void;

export function parseChatGPTOutput(output: string, callback: OnFileParsed) {
    // Pattern to identify filename and match contents until the next filename or end
    const filePattern = /\[([\w._-]+)\]\n```(?:\s|\S)*?\n((?:\s|\S)*?)\n```/g;

    let match: RegExpExecArray | null;

    // Loop over each match found by the regular expression.
    while ((match = filePattern.exec(output)) !== null) {
        // Extract filename and content from the matched result.
        const [, filename, content] = match;

        // Invoke the callback with the filename and the extracted content.
        callback(filename, content);
    }
}

