import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef } from "react";

import {
    AutoAwesomeIcon,
    Autocomplete,
    AutocompleteItem,
    AutoFixHighIcon,
    Button,
    CircularProgress,
    ClearIcon,
    cls,
    defaultBorderMixin,
    focusedDisabled,
    IconButton,
    SendIcon,
    TextareaAutosize,
    Tooltip,
    useAutoComplete
} from "@firecms/ui";
import {
    EntityStatus,
    isPropertyBuilder,
    PluginFormActionProps,
    PropertiesOrBuilders,
    Property,
    PropertyOrBuilder,
    singular,
    stripCollectionPath,
} from "@firecms/core";
import { useDataEnhancementController } from "./DataEnhancementControllerProvider";
import { SamplePrompt } from "../types/data_enhancement_controller";
import { countStringCharacters } from "../utils/countStringCharacters";

const DEFAULT_HEIGHT = 52;

export function FormEnhanceAction({
                                      entityId,
                                      path,
                                      status,
                                      collection,
                                      formContext
                                  }: PluginFormActionProps) {

    const inputRef = React.useRef<HTMLInputElement>(null);
    // const autocompleteRef = React.useRef<HTMLDivElement>(null);

    const [internalStatus, setInternalStatus] = React.useState<EntityStatus>(status);
    const storageKey = createLocalStorageKey(path, internalStatus);

    const [loading, setLoading] = React.useState(false);
    const dataEnhancementController = useDataEnhancementController();

    const [samplePrompts, setSamplePrompts] = React.useState<SamplePrompt[] | undefined>(undefined);
    const [instructions, setInstructions] = React.useState<string>("");
    const [height, setHeight] = React.useState<number | undefined>(DEFAULT_HEIGHT);

    const {
        inputFocused,
        autoCompleteOpen,
        setAutoCompleteOpen
    } = useAutoComplete({
        ref: inputRef
    });

    const placeholder = useMemo(() => getPlaceholder(collection.singularName ?? collection.name, samplePrompts), [samplePrompts]);

    const {
        suggestions,
        getSamplePrompts
    } = dataEnhancementController;

    const loadingPrompts = useRef(false);
    const updateSuggestedPrompts = useCallback(async function updateSuggestedPrompts(instructions?: string) {
            if (loadingPrompts.current) return;
            loadingPrompts.current = true;
            const prompts = internalStatus === "new"
                ? (await getSamplePrompts(collection.singularName ?? collection.name, instructions)).prompts
                : getPromptsForExistingEntities(collection.properties);

            const recentPromptsFromStorage = getRecentPromptsFromStorage(storageKey);
            const recentPrompts = recentPromptsFromStorage.map(prompt => prompt.prompt);
            setSamplePrompts([...recentPromptsFromStorage, ...prompts.filter(p => !recentPrompts.includes(p.prompt))].slice(0, 5));
            loadingPrompts.current = false;
        },
        [collection.name, collection.singularName, getSamplePrompts, internalStatus]);

    const deferredValues = useDeferredValue(formContext?.values);
    const enoughData = countStringCharacters(deferredValues, collection.properties) > 20;

    useEffect(() => {
        if (!samplePrompts) {
            setSamplePrompts(getRecentPromptsFromStorage(storageKey));
            updateSuggestedPrompts().then();
        }
    }, [samplePrompts, storageKey, updateSuggestedPrompts, instructions, internalStatus]);

    useEffect(() => {
        updateSuggestedPrompts().then();
    }, [internalStatus]);

    const enhance = (prompt?: string) => {
        if (!entityId || !formContext?.values) return;
        setLoading(true);
        setAutoCompleteOpen(false);
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
        setAutoCompleteOpen(false);
        enhance(instructions);
    }

    return (
        <div className={"relative w-full"}
             style={{ height }}>
            <div className="absolute flex flex-col items-center w-full font-medium text-sm">

                <div
                    className={cls(
                        defaultBorderMixin,
                        "border-b",
                        "flex w-full items-center gap-2 pr-4 pl-6",
                        inputFocused ? "text-primary" : "text-surface-700 dark:text-surface-200"
                    )}>

                    <AutoFixHighIcon/>
                    <TextareaAutosize
                        className={cls("flex-grow w-full resize-none w-full outline-none py-5 mx-2 bg-transparent", focusedDisabled)}
                        ref={inputRef}
                        value={instructions}
                        autoFocus={status === "new"}
                        disabled={loading || noIdSet}
                        // onFocus={onFocus}
                        // onBlur={onBlur}
                        onResize={(state) => {
                            setHeight(state.outerHeightStyle);
                        }}
                        placeholder={noIdSet ? "Please set an ID first" : placeholder?.prompt}
                        onClick={() => {
                            if (!autoCompleteOpen)
                                setAutoCompleteOpen(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                submit();
                            }
                            if (e.key === "Escape" && autoCompleteOpen) {
                                setAutoCompleteOpen(false);
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => {
                            if (noIdSet) return;
                            setInstructions(e.target.value);
                        }}
                    />
                    <Autocomplete
                        open={autoCompleteOpen}
                        setOpen={setAutoCompleteOpen}>
                        {samplePrompts?.map((samplePrompt, index) => {
                            return <AutocompleteItem
                                key={index + "_" + samplePrompt.prompt}
                                onClick={() => {
                                    setInstructions(samplePrompt.prompt);
                                    enhance(samplePrompt.prompt);
                                }}
                            >
                                <div className={"flex-grow"}>
                                    {samplePrompt.prompt}
                                </div>

                                {samplePrompt.type === "recent" && <IconButton
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeRecentPrompt(storageKey, samplePrompt.prompt);
                                        setSamplePrompts((samplePrompts ?? []).filter(p => p.prompt !== samplePrompt.prompt));
                                    }}
                                    size={"small"}
                                >
                                    <ClearIcon size="small"/>
                                </IconButton>
                                }
                            </AutocompleteItem>;
                        })}

                    </Autocomplete>

                    {!loading && instructions && <IconButton
                        size={"small"}
                        onClick={() => {
                            setInstructions("");
                            inputRef.current?.focus();
                        }}
                        color={inputFocused || !instructions ? "primary" : undefined}
                        disabled={loading}>
                        <ClearIcon size={"small"}/>
                    </IconButton>}

                    {(loading || instructions) && <IconButton
                        onClick={() => enhance(instructions)}
                        size={"large"}
                        color={inputFocused || !instructions ? "primary" : undefined}
                        className={cls(!instructions ? "!bg-surface-accent-50 dark:!bg-surface-accent-800" : "")}
                        disabled={loading}>
                        {loading &&
                            <CircularProgress size={"small"}/>}
                        {!loading && instructions &&
                            <SendIcon color={"primary"}/>}
                    </IconButton>}

                    {!loading && !instructions && <Tooltip
                        asChild={true}
                        title={!enoughData
                            ? "You need to input some data in the form before enhancing this entity, or use the prompt to give specific instructions"
                            : "Try to fill the missing fields. You can use the prompt to give specific instructions"}>
                        <Button variant={"outlined"}
                                size={"small"}
                                onClick={() => enhance()}
                                disabled={!enoughData || loading}>
                            <AutoAwesomeIcon color={"primary"}/>
                            Autofill
                        </Button>
                    </Tooltip>}

                </div>

                {/*{samplePrompts &&*/}
                {/*    <Collapse*/}
                {/*        in={autocompleteOpen}*/}
                {/*        duration={100}*/}
                {/*        className={cn(*/}
                {/*            defaultBorderMixin,*/}
                {/*            autocompleteOpen ? "border-b shadow " : "",*/}
                {/*            "bg-surface-100 dark:bg-surface-900",*/}
                {/*            "z-20",*/}
                {/*            "w-full")}>*/}
                {/*        <div ref={autocompleteRef}>*/}
                {/*            {samplePrompts?.map((samplePrompt, index) => {*/}
                {/*                return <div*/}
                {/*                    key={index}*/}
                {/*                    className={"flex w-full items-center pr-6 pl-16 h-[48px] cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"}*/}
                {/*                    onClick={() => {*/}
                {/*                        setInstructions(samplePrompt.prompt);*/}
                {/*                        enhance(samplePrompt.prompt);*/}
                {/*                    }}*/}
                {/*                >*/}
                {/*                    <div className={"flex-grow"}>*/}
                {/*                        {samplePrompt.prompt}*/}
                {/*                    </div>*/}

                {/*                    {samplePrompt.type === "recent" && <IconButton*/}
                {/*                        onClick={(e) => {*/}
                {/*                            e.preventDefault();*/}
                {/*                            e.stopPropagation();*/}
                {/*                            removeRecentPrompt(storageKey, samplePrompt.prompt);*/}
                {/*                            setSamplePrompts((samplePrompts ?? []).filter(p => p.prompt !== samplePrompt.prompt));*/}
                {/*                        }}*/}
                {/*                        size={"small"}*/}
                {/*                    >*/}
                {/*                        <ClearIcon size="small"/>*/}
                {/*                    </IconButton>*/}
                {/*                    }*/}
                {/*                </div>;*/}
                {/*            })}*/}
                {/*        </div>*/}
                {/*    </Collapse>}*/}

            </div>
        </div>
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

function getPlaceholder(name: string, prompts?: SamplePrompt[]) {
    const samplePrompts: SamplePrompt[] = (prompts ?? []).length > 0
        ? (prompts as SamplePrompt[])
        : [
            "e.g. I want to generate a new document about...",
            "e.g. Add a paragraph to the description",
            `e.g. Generate a new ${singular(name)} related to...`
        ].map(p => ({
            prompt: p,
            type: "sample"
        }));
    return samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
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
