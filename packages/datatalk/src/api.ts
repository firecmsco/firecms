export function sendDataTalkCommand(command: string) {
    console.log(`Sending command ${command} to DataTalk API`);
    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
    };

    return fetch("https://datatalkapi-drplyi3b6q-ey.a.run.app/datatalk/command", options)
        .then(response => response.json())
        .then(response => {
            console.log(response);
            const code = response.data.code;
            console.log("DataTalk API responded with:\n", response.data.code);
            return {
                code
            }
        });
}
