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
            console.log("DataTalk API responded with:\n", response.data.code);
            return {
                ...response.data,
                date: new Date()
            } as ChatMessage;
        });
}
