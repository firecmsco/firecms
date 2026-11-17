import { describe, expect, it, jest } from "@jest/globals";
import { loadMediaPreviews } from "../../media_manager/src/media_previews.js";

describe("media previews", () => {
    it("publishes each preview without waiting for a slow request", async () => {
        let finishSlow!: (value: string | undefined) => void;
        const slow = new Promise<string | undefined>(resolve => { finishSlow = resolve; });
        const published = jest.fn();
        const done = loadMediaPreviews([{ id: "slow" }, { id: "fast" }], async asset => asset.id === "slow" ? slow : "fast-url", published);
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(published).toHaveBeenCalledWith("fast", "fast-url");
        expect(published).not.toHaveBeenCalledWith("slow", expect.anything());
        finishSlow("slow-url");
        await done;
        expect(published).toHaveBeenCalledWith("slow", "slow-url");
    });

    it("keeps other previews working when one fails", async () => {
        const published = jest.fn();
        await loadMediaPreviews([{ id: "bad" }, { id: "good" }], async asset => {
            if (asset.id === "bad") throw new Error("unavailable");
            return "good-url";
        }, published);
        expect(published).toHaveBeenCalledWith("good", "good-url");
    });
});
