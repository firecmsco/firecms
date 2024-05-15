import { ChatMessage } from "./types";

export async function streamDataTalkCommand(firebaseAccessToken: string,
                                            command: string,
                                            apiEndpoint: string,
                                            sessionId: string,
                                            messages: ChatMessage[],
                                            onDelta: (delta: string) => void
): Promise<string> {

    // eslint-disable-next-line no-async-promise-executor
    return new Promise<string>(async (resolve, reject) => {
        try {
            const response = await fetch(apiEndpoint + "/datatalk/command", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                },
                body: JSON.stringify({
                    sessionId,
                    command,
                    history: messages
                })
            });

            if (!response.ok) {
                const data = await response.json();
                console.error("Error streaming data talk command", data);
                reject(new ApiError(data.message, data.code));
                return;
            }

            if (response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                let result = "";
                const processChunk = (chunk: ReadableStreamReadResult<Uint8Array>): void | Promise<void> => {
                    if (chunk.done) {
                        console.log("Stream completed", { result });
                        resolve(result);
                        return;
                    }

                    // Decoding chunk value to text
                    const text = decoder.decode(chunk.value, { stream: true });
                    buffer += text;

                    // Split based on our special prefix and filter out empty strings
                    const parts = buffer.split("&$# ").filter(part => part.length > 0);

                    // Check if the last part is incomplete (no trailing prefix for next message)
                    if (!text.endsWith("&$# ")) {
                        buffer = parts.pop() || ""; // Save incomplete part back to buffer, or empty it if there's none
                    } else {
                        buffer = ""; // Reset buffer as all parts are complete
                    }

                    // Process complete messages
                    parts.forEach(part => {
                        try {
                            const message = JSON.parse(part);
                            if (message.type === "delta") {
                                console.log("Delta received:", message.data.delta);
                                result += message.data.delta;
                                onDelta(message.data.delta);
                            } else if (message.type === "result") {
                                console.log("Result received:", message.data);
                                resolve(message.data.text);
                            }
                        } catch (error) {
                            console.error("Error parsing message part:", part, error);
                        }
                    });

                    // Read the next chunk
                    reader.read().then(processChunk);
                };

                // Start reading the stream
                reader.read().then(processChunk);
            }
        } catch (error) {
            console.error("Error streaming data talk command", error);
            reject(error);
        }
    });
}

export function getDataTalkSamplePrompts(firebaseAccessToken: string,
                                         apiEndpoint: string,
                                         messages?: ChatMessage[]
): Promise<string[]> {
    return fetch(apiEndpoint + "/datatalk/sample_prompts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseAccessToken}`
        },
        body: JSON.stringify({
            history: messages ?? []
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new ApiError(data.message, data.code);
                });
            }
            return response.json();
        })
        .then(data => data.data);
}

export class ApiError extends Error {

    public code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.code = code;
    }
}
