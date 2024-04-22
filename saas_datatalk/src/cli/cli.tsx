import { CenteredView } from "@firecms/ui";
import { useEffect } from "react";
import { FireCMSBackend } from "@firecms/cloud";

export function FireCMSCLIView({ fireCMSBackend }: { fireCMSBackend: FireCMSBackend }) {



    useEffect(() => {
        const socket = new WebSocket("ws://localhost:9117");

// Connection opened
        socket.addEventListener("open", (event) => {
            fireCMSBackend.getBackendAuthToken().then(token => {
                socket.send(JSON.stringify({
                    type: "auth",
                    token
                }));
            });
        });

// Listen for messages
        socket.addEventListener("message", (event) => {
            console.log("Message from server: ", event.data);
        });
    }, []);
    return <CenteredView>You can close this tab now 🚀</CenteredView>;
}
