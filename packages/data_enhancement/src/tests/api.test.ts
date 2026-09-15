import {
    createStreamRecordParser,
    DataEnhancementError,
    enhanceDataAPIStream,
    fetchEntityPromptSuggestion,
    isPaymentRequiredError
} from "../api";

const SEPARATOR = "&$# ";

function record(type: string, data: unknown) {
    return SEPARATOR + JSON.stringify({
        type,
        data
    });
}

/**
 * A response whose body yields exactly these chunks. Not `new Response(stream)`: the
 * tests depend on the reader seeing these boundaries and no others.
 */
function streamingResponse(chunks: Array<string | Uint8Array>): Response {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
            }
            controller.close();
        }
    });
    return {
        ok: true,
        status: 200,
        statusText: "OK",
        body
    } as unknown as Response;
}

function runEnhance(response: Response | Error) {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    if (response instanceof Error) fetchMock.mockRejectedValue(response);
    else fetchMock.mockResolvedValue(response);

    const onUpdateDelta = jest.fn();
    const onUpdate = jest.fn();
    const onEnd = jest.fn();
    const onError = jest.fn();
    const promise = enhanceDataAPIStream({
        apiKey: "key",
        entityId: "id",
        entityName: "Case",
        values: {},
        path: "cases",
        properties: {},
        dataSource: {} as any,
        firebaseToken: "token",
        onUpdate,
        onUpdateDelta,
        onEnd,
        onError
    });
    return {
        promise,
        onUpdateDelta,
        onUpdate,
        onEnd,
        onError
    };
}

const result = {
    entityId: "id",
    suggestions: { title: "A title" },
    usage: {}
};

beforeEach(() => {
    jest.spyOn(console, "debug").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("enhanceDataAPIStream", () => {

    test("a record split across two chunks is parsed once both halves have arrived", async () => {
        // FIRECMS-SASS-12P: "Unterminated string in JSON at position 1944"
        const longValue = "The patient reports intermittent pain. ".repeat(80);
        const stream = record("suggestion_delta", {
            propertyKey: "description",
            partialValue: longValue
        }) + record("result", {
            ...result,
            suggestions: { description: longValue }
        });
        const cut = stream.indexOf("pain", 1944);

        const {
            promise,
            onUpdateDelta,
            onEnd,
            onError
        } = runEnhance(streamingResponse([stream.slice(0, cut), stream.slice(cut)]));
        await promise;

        expect(onError).not.toHaveBeenCalled();
        expect(onUpdateDelta).toHaveBeenCalledTimes(1);
        expect(onUpdateDelta).toHaveBeenCalledWith("description", longValue);
        expect(onEnd).toHaveBeenCalledTimes(1);
        expect(onEnd.mock.calls[0][0].suggestions).toEqual({ description: longValue });
    });

    test("every record arrives whole wherever the stream is cut, separators included", async () => {
        const stream = record("suggestion_delta", {
            propertyKey: "title",
            partialValue: "A ti"
        }) + record("suggestion_delta", {
            propertyKey: "title",
            partialValue: "tle"
        }) + record("suggestion", { title: "A title" }) + record("result", result);

        for (let cut = 1; cut < stream.length; cut++) {
            const {
                promise,
                onUpdateDelta,
                onUpdate,
                onEnd,
                onError
            } = runEnhance(streamingResponse([stream.slice(0, cut), stream.slice(cut)]));
            await promise;

            expect(onError).not.toHaveBeenCalled();
            expect(onUpdateDelta.mock.calls).toEqual([["title", "A ti"], ["title", "tle"]]);
            expect(onUpdate.mock.calls).toEqual([[{ title: "A title" }]]);
            expect(onEnd.mock.calls).toEqual([[result]]);
        }
    });

    test("a multi-byte character split across chunks is decoded whole", async () => {
        const bytes = new TextEncoder().encode(record("suggestion_delta", {
            propertyKey: "title",
            partialValue: "Café 🚀"
        }) + record("result", result));
        // The four bytes of the emoji start right after "Café " in the JSON.
        const emojiStart = bytes.indexOf(0xF0);

        const {
            promise,
            onUpdateDelta,
            onError
        } = runEnhance(streamingResponse([bytes.slice(0, emojiStart + 2), bytes.slice(emojiStart + 2)]));
        await promise;

        expect(onError).not.toHaveBeenCalled();
        expect(onUpdateDelta).toHaveBeenCalledWith("title", "Café 🚀");
    });

    test("a malformed record fails the enhancement once, with a readable error, and stops", async () => {
        const {
            promise,
            onUpdateDelta,
            onEnd,
            onError
        } = runEnhance(streamingResponse([
            record("suggestion_delta", {
                propertyKey: "title",
                partialValue: "A"
            }) + SEPARATOR + "{\"type\":\"sugg",
            SEPARATOR + "garbage" + record("suggestion_delta", {
                propertyKey: "title",
                partialValue: "B"
            }),
            record("result", result)
        ]));

        await expect(promise).resolves.toBeUndefined();
        expect(onUpdateDelta.mock.calls).toEqual([["title", "A"]]);
        expect(onEnd).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
        const error = onError.mock.calls[0][0];
        expect(error).toBeInstanceOf(DataEnhancementError);
        expect(error.code).toBe("invalid-stream-record");
        expect(error.message).toBe("The autofill response could not be read");
    });

    test("a stream cut in the middle of its last record fails instead of hanging", async () => {
        const {
            promise,
            onEnd,
            onError
        } = runEnhance(streamingResponse([
            record("suggestion_delta", {
                propertyKey: "title",
                partialValue: "A"
            }) + SEPARATOR + "{\"type\":\"result\",\"data\":{\"sugg"
        ]));
        await promise;

        expect(onEnd).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError.mock.calls[0][0].code).toBe("incomplete-stream");
    });

    test("a stream that ends without a result fails instead of hanging", async () => {
        // The backend ends the response without a result when it fails mid-stream.
        const {
            promise,
            onUpdateDelta,
            onEnd,
            onError
        } = runEnhance(streamingResponse([
            record("suggestion_delta", {
                propertyKey: "title",
                partialValue: "A"
            })
        ]));
        await promise;

        expect(onUpdateDelta).toHaveBeenCalledTimes(1);
        expect(onEnd).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError.mock.calls[0][0].code).toBe("incomplete-stream");
    });

    test("a 402 is reported as payment required, not thrown", async () => {
        // FIRECMS-SASS-12Q
        const {
            promise,
            onEnd,
            onError
        } = runEnhance(new Response(JSON.stringify({
            message: "Payment required",
            code: "payment-required",
            data: { projectId: "medicine-journal" }
        }), { status: 402 }));

        await expect(promise).resolves.toBeUndefined();
        expect(onEnd).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
        const error = onError.mock.calls[0][0];
        expect(error).toBeInstanceOf(DataEnhancementError);
        expect(error.message).toBe("Payment required");
        expect(error.status).toBe(402);
        expect(error.data).toEqual({ projectId: "medicine-journal" });
        expect(isPaymentRequiredError(error)).toBe(true);
    });

    test("a 402 without a JSON body still counts as payment required", async () => {
        const {
            promise,
            onError
        } = runEnhance(new Response("<html>Payment Required</html>", { status: 402 }));
        await promise;

        const error = onError.mock.calls[0][0];
        expect(error.message).toBe("Autofill failed (HTTP 402)");
        expect(isPaymentRequiredError(error)).toBe(true);
    });

    test("other HTTP errors carry the backend message, status and code", async () => {
        const {
            promise,
            onError
        } = runEnhance(new Response(JSON.stringify({
            message: "You have exceeded the monthly quota for this user.",
            code: "enhancement:quota-exceeded",
            data: {}
        }), { status: 401 }));
        await promise;

        const error = onError.mock.calls[0][0];
        expect(error.message).toBe("You have exceeded the monthly quota for this user.");
        expect(error.status).toBe(401);
        expect(error.code).toBe("enhancement:quota-exceeded");
        expect(isPaymentRequiredError(error)).toBe(false);
    });

    test("a network failure is reported through onError, not thrown", async () => {
        const {
            promise,
            onError
        } = runEnhance(new TypeError("Failed to fetch"));

        await expect(promise).resolves.toBeUndefined();
        expect(onError).toHaveBeenCalledWith(new TypeError("Failed to fetch"));
    });
});

describe("createStreamRecordParser", () => {
    test("emits a complete last record without waiting for the stream to close", () => {
        // The backend logs usage after writing the result and before closing the stream.
        const records: unknown[] = [];
        const parser = createStreamRecordParser((r) => records.push(r));
        parser.push(record("result", result));
        expect(records).toEqual([{
            type: "result",
            data: result
        }]);
        parser.end();
        expect(records).toHaveLength(1);
    });
});

describe("fetchEntityPromptSuggestion", () => {

    test("a failed request names the request and the status instead of an empty message", async () => {
        // FIRECMS-SASS-12N: the backend replies to a bad request with { data: { prompts: [] } }
        jest.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({ data: { prompts: [] } }), { status: 400 }));

        const request = fetchEntityPromptSuggestion({
            entityName: "Video question",
            firebaseToken: "token",
            apiKey: "key"
        });
        await expect(request).rejects.toBeInstanceOf(DataEnhancementError);
        await expect(request).rejects.toMatchObject({
            message: "Loading sample prompts failed (HTTP 400)",
            status: 400
        });
    });

    test("returns the prompts on success", async () => {
        jest.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({ data: { prompts: ["Write a question", "Add an answer"] } }), { status: 200 }));

        await expect(fetchEntityPromptSuggestion({
            entityName: "Video question",
            firebaseToken: "token",
            apiKey: "key"
        })).resolves.toEqual({
            prompts: [
                {
                    prompt: "Write a question",
                    type: "sample"
                },
                {
                    prompt: "Add an answer",
                    type: "sample"
                }
            ]
        });
    });
});
