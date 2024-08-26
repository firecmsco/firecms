import { autocompleteStream } from "../api";

type UseEditorAIController = {
    autocomplete: (textBefore: string, textAfter: string, onUpdate: (delta: string) => void) => Promise<string>;
}

export function useEditorAIController({ firebaseToken }: { firebaseToken?: string }): UseEditorAIController {
    const autocomplete = async (textBefore: string, textAfter: string, onUpdate: (delta: string) => void) => {
        if (!firebaseToken) {
            throw new Error("Firebase token is required");
        }
        return autocompleteStream({
            firebaseToken,
            textBefore,
            textAfter,
            onUpdate
        });
    }

    return {
        autocomplete
    };
}

// async function * generateLoremIpsum(): AsyncGenerator<string> {
//     const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n# Heading\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
//
//     const words = loremIpsum.split(" ");
//
//     for (const word of words) {
//         yield word;
//         await new Promise(resolve => setTimeout(resolve, 100));
//     }
// }
//
// const generator = generateLoremIpsum();
// for await (const word of generator) {
//
// }
