import { EntityValues } from "@firecms/types";
import { EditorAIController } from "@firecms/editor";

export type EnhanceParams<M extends object> = {
    entityId?: string | number;
    propertyKey?: string;
    propertyInstructions?: string;
    values: EntityValues<M>;
    instructions?: string;
    replaceValues: boolean;
};

export type DataEnhancementController = {
    /**
     * Whether the data enhancement is enabled for the current path
     */
    enabled: boolean;
    suggestions: Record<string, string | number>;
    enhance: <M extends object>(props: EnhanceParams<M>) => Promise<EnhancedDataResult | null>;
    clearSuggestion: (key: string, suggestion: string | number) => void;
    allowReferenceDataSelection: boolean;
    clearAllSuggestions: () => void;
    getSamplePrompts: (entityName: string, input?: string) => Promise<SamplePromptsResult>;
    loadingSuggestions: string[],
    editorAIController?: EditorAIController;
}

export type EnhancedDataResult = {
    entityId?: string | number;
    suggestions: {
        [key: string]: string[];
    };
    errors: string[];
    usage: { promptTokens?: number, completionTokens?: number, totalTokens?: number }
}

export type SamplePrompt = {
    prompt: string;
    type: "recent" | "sample";
}

export type SamplePromptsResult = {
    prompts: SamplePrompt[];
    host?: string;
};

export type DataEnhancementRequest = {
    entityName: string;
    entityDescription?: string;
    inputEntity: InputEntity;
    properties: Record<string, InputProperty>;
    propertyKey?: string;
    propertyInstructions?: string,
    instructions?: string;
};

export type InputEntity = {
    entityId?: string | number;
    values: Record<string, any>;
};

export type InputProperty = {
    name?: string;
    description?: string;
    type: string;
    fieldConfigId: string;
    enum?: string[];
    disabled?: boolean;
    of?: InputProperty;
    oneOf?: {
        properties: Record<string, InputProperty>;
        typeField?: string;
        valueField?: string;
    };
}
