import { ChatMessage } from "./types";

export function sendDataTalkCommand(firebaseAccessToken: string, command: string, projectId: string, history: ChatMessage[]): Promise<ChatMessage> {
    console.log(`Sending command ${command} to DataTalk API`);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseAccessToken}`
        },
        body: JSON.stringify({
            command,
            projectId,
            history
        })
    };

    return fetch("https://datatalkapi-drplyi3b6q-ey.a.run.app/datatalk/command?projectId=" + projectId, options)
        .then(response => response.json())
        .then(response => {
            console.log(response);
            console.log("DataTalk API responded with:\n", response.data);
            return {
                ...response.data,
                date: new Date()
            } as ChatMessage;
        });
}

export async function streamDataTalkCommand(firebaseAccessToken: string,
                                            command: string,
                                            projectId: string,
                                            history: ChatMessage[],
                                            onDelta: (delta: string) => void,
): Promise<string> {

    // eslint-disable-next-line no-async-promise-executor
    return new Promise<string>(async (resolve, reject) => {
        const response = await fetch("https://datatalkapi-drplyi3b6q-ey.a.run.app/datatalk/command?projectId=" + projectId, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${firebaseAccessToken}`
            },
            body: JSON.stringify({
                command,
                projectId,
                history
            })
        });

        if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let result = "";
            const processChunk = (chunk: ReadableStreamReadResult<Uint8Array>): void | Promise<void> => {
                if (chunk.done) {
                    console.log("Stream completed");
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
    });
}
