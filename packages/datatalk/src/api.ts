import { ChatMessage } from "./types";

export function sendDataTalkCommand(command: string, projectId: string, history: ChatMessage[]): Promise<ChatMessage> {
    console.log(`Sending command ${command} to DataTalk API`);
    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            command,
            projectId,
            history
        })
    };

    return fetch("https://datatalkapi-drplyi3b6q-ey.a.run.app/datatalk/command?project=" + projectId, options)
        .then(response => response.json())
        .then(response => {
            console.log(response);
            const newMessage: ChatMessage = response.data;
            console.log("DataTalk API responded with:\n", response.data.code);
            return newMessage;
        });
}
