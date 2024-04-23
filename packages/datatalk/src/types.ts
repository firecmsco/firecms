export type ChatMessage = {
    text: string;
    user: "USER" | "SYSTEM";
    date: Date;
};
