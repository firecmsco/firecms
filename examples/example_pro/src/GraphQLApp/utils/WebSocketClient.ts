import ReconnectingWebSocket from "reconnecting-websocket";

type Callback = (response: any) => void;
type SubscriptionCallback<TYPE = string> = (update: {
    type: TYPE,
    data: any,
    success: boolean,
    error?: any
}) => void;

/**
 * WebSocketClient manages the WebSocket connection and handles
 * sending requests and managing subscriptions.
 */
class WebSocketClient {
    private socket: ReconnectingWebSocket;
    private callbacks: Map<string, Callback>;
    private subscriptions: Map<string, SubscriptionCallback<any>>;

    constructor(url: string) {
        this.socket = new ReconnectingWebSocket(url);
        this.callbacks = new Map();
        this.subscriptions = new Map();

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const {
                type,
                requestId,
                success,
                data,
                error
            } = message;

            console.log("!! Received message:", message);

            // Handle subscription updates
            if (type === "subscriptionUpdate" || type === "subscriptionDelete") {
                if (requestId && this.subscriptions.has(requestId)) {
                    const callback = this.subscriptions.get(requestId)!;
                    callback({
                        type,
                        data,
                        success,
                        error
                    });
                } else {
                    console.error("Subscription not found for requestId:", requestId);
                }
                return;
            }

            // Handle regular responses
            if (requestId && this.callbacks.has(requestId)) {
                const callback = this.callbacks.get(requestId)!;
                if (success) {
                    callback({
                        success,
                        data
                    });
                } else {
                    callback({
                        success,
                        error
                    });
                }
                this.callbacks.delete(requestId);
            }
        };

        this.socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed");
        };
    }

    /**
     * Sends a request to the server.
     * @param type - Type of the request (e.g., 'fetchEntity', 'saveEntity', etc.)
     * @param payload - Payload of the request
     * @returns Promise resolving with the response data or rejecting with an error
     */
    sendRequest(type: string, payload: any): Promise<any> {
        const requestId = this.generateRequestId();
        console.log("!! Sending request:", type, payload);
        return new Promise((resolve, reject) => {
            this.callbacks.set(requestId, (response: any) => {
                if (response.success) {
                    resolve(response.data);
                } else {
                    reject(response.error);
                }
            });

            const message = {
                type,
                payload,
                requestId
            };

            this.socket.send(JSON.stringify(message));
        });
    }

    /**
     * Subscribes to real-time updates.
     * @param type - Subscription type ('listenCollection' or 'listenEntity')
     * @param payload - Subscription payload
     * @param callback - Callback to handle updates
     * @returns A unique subscription ID
     */
    subscribe<TYPE = string>(type: string, payload: any, callback: SubscriptionCallback<TYPE>): string {
        const requestId = this.generateRequestId();
        this.subscriptions.set(requestId, callback);

        const message = {
            type,
            payload,
            requestId
        };

        this.socket.send(JSON.stringify(message));
        return requestId;
    }

    /**
     * Unsubscribes from real-time updates.
     * @param requestId - Subscription ID to unsubscribe
     */
    unsubscribe(requestId: string) {
        this.subscriptions.delete(requestId);
    }

    /**
     * Generates a unique request ID.
     */
    private generateRequestId(): string {
        return Math.random().toString(36).substring(2, 15);
    }
}

export default WebSocketClient;
