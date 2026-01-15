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

export async function enhanceDataAPIStream<M extends object>(props: {
    apiKey: string,
    entityId?: string | number,
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
}) {

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

    return fetch((props.host ?? DEFAULT_SERVER) + "/data/enhance_stream/",
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
        })
        .then(async (res) => {
            if (!res.ok) {
                console.error("enhanceDataAPIStream error", res)
                throw await res.json();
            }
            const reader = res.body?.getReader();
            if (!reader) {
                throw new Error("No reader");
            }

            for await (const chunk of readChunks(reader)) {
                const str = new TextDecoder().decode(chunk);
                try {
                    str.split("&$# ").forEach((s) => {
                        if (s && s.length > 0) {
                            const data = JSON.parse(s.trim());
                            if (data.type === "suggestion_delta")
                                props.onUpdateDelta(data.data.propertyKey, data.data.partialValue);
                            else if (data.type === "suggestion")
                                props.onUpdate(data.data);
                            else if (data.type === "result")
                                props.onEnd(data.data);
                        }
                    });
                } catch (e: any) {
                    console.error("str", str);
                    console.error("Error parsing stream", e);
                    props.onError(e);
                }
            }

        });

}

function readChunks(reader: ReadableStreamDefaultReader) {
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

export async function fetchEntityPromptSuggestion<M extends object>(props: {
    input?: string,
    entityName: string,
    firebaseToken: string,
    apiKey: string,
    host?: string
}): Promise<SamplePromptsResult> {

    return fetch((props.host ?? DEFAULT_SERVER) + "/data/prompt_autocomplete/",
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
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                console.error("fetchEntityPromptSuggestion", data);
                throw Error(data.message);
            }
            return {
                prompts: data.data.prompts.map((e: string) => ({
                    prompt: e,
                    type: "sample"
                }))
            };
        });

}

export async function autocompleteStream(props: {
    firebaseToken: string,
    textBefore?: string,
    textAfter: string,
    host?: string;
    onUpdate: (delta: string) => void;
}) {

    let result = "";
    return fetch((props.host ?? DEFAULT_SERVER) + "/data/autocomplete/",
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
        })
        .then(async (res) => {
            if (!res.ok) {
                console.error("enhanceDataAPIStream error", res)
                throw await res.json();
            }
            const reader = res.body?.getReader();
            if (!reader) {
                throw new Error("No reader");
            }

            for await (const chunk of readChunks(reader)) {
                const str = new TextDecoder().decode(chunk);
                result += str;
                console.debug("Autocomplete update:", str);
                props.onUpdate(str);
            }

        }).then(() => {
            console.debug("Autocomplete result:", result);
            return result;
        });

}
