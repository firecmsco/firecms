import { autocompleteStream } from "../api";
import { EditorAIController } from "@firecms/editor";

export function useEditorAIController({ getAuthToken }: { getAuthToken?: () => Promise<string> }): EditorAIController {
    const autocomplete = async (textBefore: string, textAfter: string, onUpdate: (delta: string) => void) => {
        if (!getAuthToken) {
            throw new Error("Firebase token is required");
        }
        const firebaseToken = await getAuthToken();
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
