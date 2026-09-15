import {
    DataEnhancementRequest,
    EnhancedDataResult,
    InputEntity,
    InputProperty,
    SamplePromptsResult
} from "./types/data_enhancement_controller";
import { DataSource, EntityValues } from "@firecms/core";
import { flatMapEntityValues } from "./utils/values";

// const DEFAULT_SERVER = "http://localhost:5001/firecms-dev-2da42/europe-west3/api"; // Local

const DEFAULT_SERVER = "https://api.firecms.co";

/**
 * Error raised by the data enhancement API calls.
 *
 * It carries the HTTP status and the backend's error `code`, so callers can tell an
 * expected state (402: no plan, or no free runs left) from a failure, and its message
 * is never empty.
 */
export class DataEnhancementError extends Error {
    readonly status?: number;
    readonly code?: string;
    readonly data?: Record<string, unknown>;

    constructor(message: string, options: {
        status?: number;
        code?: string;
        data?: Record<string, unknown>;
        cause?: unknown;
    } = {}) {
        super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
        this.name = "DataEnhancementError";
        this.status = options.status;
        this.code = options.code;
        this.data = options.data;
    }
}

/**
 * Whether the backend refused the request because the project needs a paid plan.
 */
export function isPaymentRequiredError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const { status, code } = error as { status?: unknown, code?: unknown };
    return status === 402 || code === "payment-required";
}

/**
 * The backend answers most errors with `{ message, code, data }`, but not all of them:
 * prompt_autocomplete replies to a bad request with a bare `{ data: { prompts: [] } }`,
 * and anything in front of the backend may answer with no JSON at all. Reading
 * `body.message` blindly produced `Error()` with an empty message (FIRECMS-SASS-12N).
 */
async function errorFromResponse(res: Response, request: string): Promise<DataEnhancementError> {
    let body: any;
    try {
        body = await res.json();
    } catch {
        body = undefined;
    }
    const serverMessage = firstNonEmptyString(body?.message, body?.error?.message, body?.error);
    const code = firstNonEmptyString(body?.code, body?.error?.code)
        ?? (res.status === 402 ? "payment-required" : undefined);
    const data = body?.data && typeof body.data === "object" ? body.data : undefined;
    const message = serverMessage
        ?? `${request} failed (HTTP ${res.status}${res.statusText ? " " + res.statusText : ""})`;
    return new DataEnhancementError(message, {
        status: res.status,
        code,
        data
    });
}

function firstNonEmptyString(...values: unknown[]): string | undefined {
    return values.find((v): v is string => typeof v === "string" && v.trim().length > 0);
}

/**
 * The backend writes this in front of every record of the enhance stream:
 * `&$# {"type":"suggestion_delta",...}&$# {"type":"result",...}`
 */
const STREAM_RECORD_SEPARATOR = "&$# ";

export type EnhanceStreamRecord = {
    type: "suggestion_delta" | "suggestion" | "result" | string;
    data: any;
};

/**
 * Reassembles enhance stream records from network chunks.
 *
 * A chunk ends wherever the network cut it, so a record, or the separator itself, can
 * straddle two chunks. Parsing every piece of every chunk as it came threw
 * "Unterminated string in JSON" whenever a long record was split (FIRECMS-SASS-12P).
 * Text followed by another separator is complete; the text after the last separator
 * waits for the next chunk, or for the end of the stream.
 */
export function createStreamRecordParser(onRecord: (record: EnhanceStreamRecord) => void) {
    let pending = "";

    const parseRecord = (text: string) => {
        const json = text.trim();
        if (!json) return;
        let record: EnhanceStreamRecord;
        try {
            record = JSON.parse(json);
        } catch (e) {
            console.error("Could not parse a data enhancement stream record", json.slice(0, 500));
            throw new DataEnhancementError("The autofill response could not be read", {
                code: "invalid-stream-record",
                cause: e
            });
        }
        onRecord(record);
    };

    return {
        push(text: string) {
            pending += text;
            const segments = pending.split(STREAM_RECORD_SEPARATOR);
            pending = segments.pop() ?? "";
            segments.forEach(parseRecord);

            // The backend writes the result and then logs usage before it closes the
            // stream. Holding a tail that is already whole until the close would delay the
            // result by that long, so emit it now if it parses. Records are JSON objects,
            // and no proper prefix of a JSON object is itself a JSON object, so a tail that
            // parses as one is complete.
            if (pending.trimEnd().endsWith("}")) {
                const record = parseObjectOrUndefined(pending);
                if (record) {
                    pending = "";
                    onRecord(record);
                }
            }
        },
        end() {
            const rest = pending.trim();
            pending = "";
            if (!rest) return;
            const record = parseObjectOrUndefined(rest);
            if (!record) {
                // The stream was cut in the middle of a record.
                throw new DataEnhancementError("The autofill response ended before it was complete", {
                    code: "incomplete-stream"
                });
            }
            onRecord(record);
        }
    };
}

function parseObjectOrUndefined(text: string): EnhanceStreamRecord | undefined {
    try {
        const value = JSON.parse(text);
        return value && typeof value === "object" ? value : undefined;
    } catch {
        return undefined;
    }
}

function toError(error: unknown): Error {
    return error instanceof Error ? error : new DataEnhancementError(String(error));
}

/**
 * Streams an enhancement from the backend.
 *
 * Every outcome is reported through the callbacks, exactly once: `onEnd` with the
 * result, or `onError`. The returned promise does not reject.
 */
export async function enhanceDataAPIStream<M extends object>(props: {
    apiKey: string,
    entityId: string,
    entityName: string,
    entityDescription?: string,
    propertyKey?: string,
    propertyInstructions?: string;
    values: EntityValues<M>,
    path: string,
    properties: Record<string, InputProperty>,
    dataSource: DataSource,
    instructions?: string,
    firebaseToken: string,
    onUpdate: (suggestions: Record<string, any>) => void;
    onUpdateDelta: (propertyKey: string, partialValue: any) => void;
    onError: (error: Error) => void;
    onEnd: (result: EnhancedDataResult) => void;
    host?: string;
}): Promise<void> {

    const flatValues = flatMapEntityValues(props.values);

    const properties = props.properties;

    const inputEntity: InputEntity = {
        entityId: props.entityId,
        values: flatValues
    }

    const request: DataEnhancementRequest = {
        inputEntity,
        properties,
        entityName: props.entityName,
        entityDescription: props.entityDescription,
        propertyKey: props.propertyKey,
        propertyInstructions: props.propertyInstructions,
        instructions: props.instructions
    };

    console.debug("enhanceDataAPIStream", request);

    // Once the result or an error has been reported, anything else the stream carries is
    // ignored: a failure must not be reported once per chunk, nor follow a result.
    let settled = false;
    const end = (result: EnhancedDataResult) => {
        if (settled) return;
        settled = true;
        props.onEnd(result);
    };
    const fail = (error: unknown) => {
        if (settled) return;
        settled = true;
        props.onError(toError(error));
    };

    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
        const res = await fetch((props.host ?? DEFAULT_SERVER) + "/data/enhance_stream/",
            {
                // mode: "no-cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${props.firebaseToken}`,
                    "x-de-api-key": `Basic ${props.apiKey}`,
                    // "x-de-version": version
                },
                body: JSON.stringify(request)
            });

        if (!res.ok) {
            throw await errorFromResponse(res, "Autofill");
        }

        reader = res.body?.getReader();
        if (!reader) {
            throw new DataEnhancementError("The autofill response has no body", { status: res.status });
        }

        const parser = createStreamRecordParser((record) => {
            if (settled) return;
            if (record.type === "suggestion_delta")
                props.onUpdateDelta(record.data.propertyKey, record.data.partialValue);
            else if (record.type === "suggestion")
                props.onUpdate(record.data);
            else if (record.type === "result")
                end(record.data);
        });

        // One decoder for the whole stream, so a multi-byte character split across two
        // chunks is decoded whole instead of as two replacement characters.
        const decoder = new TextDecoder();
        for await (const chunk of readChunks(reader)) {
            parser.push(decoder.decode(chunk, { stream: true }));
        }
        parser.push(decoder.decode());
        parser.end();

        if (!settled) {
            // The backend ends the response without a result when it fails after it has
            // started streaming. Without this the enhancement would never finish.
            throw new DataEnhancementError("The autofill response ended before it was complete", {
                code: "incomplete-stream"
            });
        }
    } catch (e: unknown) {
        fail(e);
        reader?.cancel().catch(() => undefined);
    }

}

function readChunks(reader: ReadableStreamDefaultReader<Uint8Array>) {
    return {
        async * [Symbol.asyncIterator]() {
            let readResult = await reader.read();
            while (!readResult.done) {
                yield readResult.value;
                readResult = await reader.read();
            }
        }
    };
}

export async function fetchEntityPromptSuggestion(props: {
    input?: string,
    entityName: string,
    firebaseToken: string,
    apiKey: string,
    host?: string
}): Promise<SamplePromptsResult> {

    const res = await fetch((props.host ?? DEFAULT_SERVER) + "/data/prompt_autocomplete/",
        {
            // mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${props.firebaseToken}`,
                "x-de-api-key": `Basic ${props.apiKey}`
            },
            body: JSON.stringify({
                entityName: props.entityName,
                input: props.input ?? null
            })
        });

    if (!res.ok) {
        throw await errorFromResponse(res, "Loading sample prompts");
    }

    const body = await res.json();
    const prompts: unknown = body?.data?.prompts;
    if (!Array.isArray(prompts)) {
        throw new DataEnhancementError("The sample prompts response has no prompts", { status: res.status });
    }
    return {
        prompts: prompts
            .filter((e): e is string => typeof e === "string")
            .map((e) => ({
                prompt: e,
                type: "sample"
            }))
    };

}

export async function autocompleteStream(props: {
    firebaseToken: string,
    textBefore?: string,
    textAfter: string,
    host?: string;
    onUpdate: (delta: string) => void;
}): Promise<string> {

    const res = await fetch((props.host ?? DEFAULT_SERVER) + "/data/autocomplete/",
        {
            // mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${props.firebaseToken}`,
                // "x-de-version": version
            },
            body: JSON.stringify({
                textBefore: props.textBefore,
                textAfter: props.textAfter
            })
        });

    if (!res.ok) {
        throw await errorFromResponse(res, "Autocomplete");
    }
    const reader = res.body?.getReader();
    if (!reader) {
        throw new DataEnhancementError("The autocomplete response has no body", { status: res.status });
    }

    let result = "";
    const decoder = new TextDecoder();
    const append = (str: string) => {
        if (!str) return;
        result += str;
        console.debug("Autocomplete update:", str);
        props.onUpdate(str);
    };
    for await (const chunk of readChunks(reader)) {
        append(decoder.decode(chunk, { stream: true }));
    }
    append(decoder.decode());

    console.debug("Autocomplete result:", result);
    return result;

}
