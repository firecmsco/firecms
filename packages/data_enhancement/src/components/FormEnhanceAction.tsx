import React, { useCallback, useDeferredValue, useEffect, useRef } from "react";

import {
    AutoFixHighIcon,
    Button,
    CircularProgress,
    CloseIcon,
    cls,
    focusedDisabled,
    IconButton,
    Menu,
    MenuItem,
    SendIcon,
    Separator,
    TextareaAutosize
} from "@firecms/ui";
import {
    EntityStatus,
    isPropertyBuilder,
    PluginFormActionProps,
    PropertiesOrBuilders,
    Property,
    PropertyOrBuilder,
    stripCollectionPath,
    useLargeLayout,
} from "@firecms/core";
import { useDataEnhancementController } from "./DataEnhancementControllerProvider";
import { SamplePrompt } from "../types/data_enhancement_controller";

export function FormEnhanceAction({
                                      entityId,
                                      path,
                                      status,
                                      collection,
                                      disabled,
                                      formContext,
                                      openEntityMode
                                  }: PluginFormActionProps) {

    const largeLayout = useLargeLayout();

    const storageKey = createLocalStorageKey(path, status);

    const [loading, setLoading] = React.useState(false);
    const dataEnhancementController = useDataEnhancementController();

    const [samplePrompts, setSamplePrompts] = React.useState<SamplePrompt[] | undefined>(undefined);
    const [instructions, setInstructions] = React.useState<string>("");

    const {
        suggestions,
        getSamplePrompts
    } = dataEnhancementController;

    const loadingPrompts = useRef(false);
    const updateSuggestedPrompts = useCallback(async function updateSuggestedPrompts(instructions?: string) {
            if (loadingPrompts.current) return;
            loadingPrompts.current = true;
            const prompts = status === "new"
                ? (await getSamplePrompts(collection.singularName ?? collection.name, instructions)).prompts
                : getPromptsForExistingEntities(collection.properties);

            const recentPromptsFromStorage = getRecentPromptsFromStorage(storageKey);
            const recentPrompts = recentPromptsFromStorage.map(prompt => prompt.prompt);
            setSamplePrompts([...recentPromptsFromStorage, ...prompts.filter(p => !recentPrompts.includes(p.prompt))].slice(0, 5));
            loadingPrompts.current = false;
        },
        [collection.name, collection.singularName, getSamplePrompts, status]);

    const deferredValues = useDeferredValue(formContext?.values);
    // const enoughData = countStringCharacters(deferredValues, collection.properties) > 20;

    useEffect(() => {
        if (!samplePrompts) {
            setSamplePrompts(getRecentPromptsFromStorage(storageKey));
            updateSuggestedPrompts().then();
        }
    }, [samplePrompts, storageKey, updateSuggestedPrompts, instructions, status]);

    useEffect(() => {
        updateSuggestedPrompts().then();
    }, [status]);

    const enhance = (prompt?: string) => {
        if (!entityId || !formContext?.values) return;
        setLoading(true);
        if (prompt) {
            addRecentPrompt(storageKey, prompt);
            setSamplePrompts([{
                prompt,
                type: "recent"
            }, ...(samplePrompts ?? []).slice(0, 5)]);
        }
        return dataEnhancementController.enhance({
            entityId,
            values: formContext!.values,
            instructions: prompt,
            replaceValues: true
        }).finally(() => {
            setLoading(false);
        });
    };

    if (!dataEnhancementController?.enabled)
        return null;

    const hasSuggestions = Object.values(suggestions).filter(Boolean).length > 0;

    const disabledSuggestionActions = !hasSuggestions;
    const promptSuggestionsEnabled = (samplePrompts ?? []).length > 0 && instructions.length === 0;

    const noIdSet = !formContext?.entityId;

    function submit() {
        enhance(instructions);
    }

    return (
        <Menu
            align={"end"}
            sideOffset={8}
            className={"max-w-[100vw]"}
            trigger={<Button variant={"filled"}
                             color={"neutral"}
                             fullWidth={largeLayout && openEntityMode === "full_screen"}
                             size={"small"}
                             disabled={loading || disabled}>
                {!loading && <AutoFixHighIcon size={"small"}/>}
                {loading && <CircularProgress size={"small"}/>}
                Autofill
            </Button>}>

            <MenuItem className={"py-4"}
                      onClick={() => {
                          enhance();
                      }}>
                <AutoFixHighIcon size={"small"}/>
                Autofill based on the current content
            </MenuItem>

            <Separator orientation={"horizontal"} className={"mt-2"}/>

            {samplePrompts?.map((samplePrompt, index) => {
                return <MenuItem
                    key={index + "_" + samplePrompt.prompt}
                    onClick={() => {
                        setInstructions(samplePrompt.prompt);
                        enhance(samplePrompt.prompt);
                    }}
                >
                    <div className={"pl-9 flex-grow text-text-secondary dark:text-text-secondary-dark"}>
                        {samplePrompt.prompt}
                    </div>

                    {samplePrompt.type === "recent" && <IconButton
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeRecentPrompt(storageKey, samplePrompt.prompt);
                            setSamplePrompts((samplePrompts ?? []).filter(p => p.prompt !== samplePrompt.prompt));
                        }}
                        size={"smallest"}
                    >
                        <CloseIcon size="smallest"/>
                    </IconButton>
                    }
                </MenuItem>;
            })}

            <Separator orientation={"horizontal"}/>

            <div
                className={cls(
                    "my-2 w-[500px] max-w-full flex items-start text-surface-700 dark:text-surface-200"
                )}>

                <TextareaAutosize
                    className={cls("p-4 rounded-lg resize-none bg-surface-100 dark:bg-surface-800 mx-2 w-full flex-grow outline-none max-h-[300px] overflow-auto", focusedDisabled)}
                    value={instructions}
                    autoFocus={status === "new"}
                    disabled={loading || noIdSet}
                    onFocus={(event) => {
                        event.stopPropagation();
                    }}
                    placeholder={noIdSet ? "Please set an ID first" : "...or provide instructions"}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            submit();
                        }

                    }}
                    onChange={(e) => {
                        if (noIdSet) return;
                        setInstructions(e.target.value);
                    }}
                />

                <IconButton
                    size={"small"}
                    onClick={() => {
                        setInstructions("");
                    }}
                    color={!instructions ? "primary" : undefined}
                    disabled={loading || !instructions}>
                    <CloseIcon size={"small"}/>
                </IconButton>

                <IconButton
                    onClick={() => enhance(instructions)}
                    size={"small"}
                    color={!instructions ? "primary" : undefined}
                    disabled={loading || !instructions}>
                    {loading &&
                        <CircularProgress size={"smallest"}/>}
                    {!loading &&
                        <SendIcon color={"primary"}/>}
                </IconButton>

            </div>

        </Menu>
    );
}

export interface EnhanceDialogProps {
    open: boolean;
    onClose: () => void;
    selectReferences: () => void;
    loading: boolean;
    enhance: (instructions: string) => void;
    samplePrompts?: string[];
}

function getPromptsForExistingEntities(properties: PropertiesOrBuilders): SamplePrompt[] {

    const multilineProperties = Object.values(properties).filter((p: PropertyOrBuilder) => {
        if (isPropertyBuilder(p)) {
            return false;
        }
        return p.dataType === "string" && (p.markdown || p.multiline);
    });

    const multilinePrompt: Property | undefined = multilineProperties.length > 0
        ? multilineProperties[Math.floor(Math.random() * multilineProperties.length)] as Property
        : undefined;

    const prompts = [
        "Fill the missing fields",
        "Translate the missing content"
    ];
    if (multilinePrompt) {
        prompts.push(`Add 2 paragraphs to '${multilinePrompt.name}'`);
    }
    return prompts.map(p => ({
        prompt: p,
        type: "sample"
    }));
}

const createLocalStorageKey = (path: string, status: EntityStatus,) => {
    const statusString = status === "new" ? "new" : "existing";
    return `data_enhancement::${statusString}::${stripCollectionPath(path)}`;
};

const getRecentPromptsFromStorage = (storageKey: string): SamplePrompt[] => {
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item).map((e: string) => ({
        prompt: e,
        type: "recent"
    })) : [];
};

const addRecentPrompt = (storageKey: string, prompt: string) => {
    if (!prompt || prompt.trim().length === 0) {
        return;
    }
    const recentPrompts = getRecentPromptsFromStorage(storageKey);
    localStorage.setItem(storageKey, JSON.stringify([prompt, ...recentPrompts
        .map(e => e.prompt)
        .filter(e => e !== prompt)
        .slice(0, 5)]));
};

const removeRecentPrompt = (storageKey: string, prompt: string) => {
    localStorage.setItem(storageKey, JSON.stringify(getRecentPromptsFromStorage(storageKey)
        .map(e => e.prompt)
        .filter(e => e !== prompt)));
};
