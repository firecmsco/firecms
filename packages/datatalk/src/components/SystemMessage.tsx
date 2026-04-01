import { useEffect, useState } from "react";
import { EntityCollection, useTranslation } from "@firecms/core";
import { MarkdownElement, parseMarkdown } from "../utils/parser";
import { CodeBlock } from "./CodeBlock";
import {
    Button,
    CheckIcon,
    CloseIcon,
    ContentCopyIcon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Label,
    LoopIcon,
    Skeleton,
    TextField,
    ThumbDownOffAltIcon,
    Tooltip
} from "@firecms/ui";
import { FeedbackSlug } from "../types";

export function SystemMessage({
                                  text,
                                  loading,
                                  containerWidth,
                                  autoRunCode,
                                  collections,
                                  onRegenerate,
                                  canRegenerate,
                                  onFeedback,
                                  onUpdatedMessage,
                              }: {
    text?: string,
    loading?: boolean,
    containerWidth?: number,
    autoRunCode?: boolean,
    collections?: EntityCollection[],
    onRegenerate?: () => void,
    canRegenerate?: boolean,
    onFeedback?: (reason?: FeedbackSlug, feedbackMessage?: string) => void,
    onUpdatedMessage?: (message: string) => void,
}) {
    const { t } = useTranslation();
    const [parsedElements, setParsedElements] = useState<MarkdownElement[] | null>();

    useEffect(() => {
        if (text) {
            const markdownElements = parseMarkdown(text);
            setParsedElements(markdownElements);
        }
    }, [text]);

    const onUpdatedElements = (elements: MarkdownElement[]) => {
        const markdown = elements.map((element) => {
            if (element.type === "html") {
                return element.content;
            } else if (element.type === "code") {
                return "```javascript\n" + element.content + "\n```";
            }
            throw new Error("Unknown element type");
        }).join("\n");
        onUpdatedMessage?.(markdown);
    }

    return <>

        {parsedElements && parsedElements.map((element, index) => {
            if (element.type === "html") {
                return <div
                    className={"max-w-full prose dark:prose-invert prose-headings:font-title text-base text-surface-700 dark:text-surface-200"}
                    dangerouslySetInnerHTML={{ __html: element.content }}
                    key={index}/>;
            } else if (element.type === "code") {
                return <CodeBlock key={index}
                                  loading={loading}
                                  autoRunCode={autoRunCode}
                                  initialCode={element.content}
                                  collections={collections}
                                  onCodeModified={(updatedCode) => {
                                      const updatedElements = [...parsedElements];
                                      updatedElements[index] = {
                                          type: "code",
                                          content: updatedCode
                                      };
                                      setParsedElements(updatedElements);
                                      onUpdatedElements(updatedElements);
                                  }}
                                  maxWidth={containerWidth ? containerWidth - 90 : undefined}/>;
            } else {
                console.error("Unknown element type", element);
                return null;
            }
        })}

        {loading && <Skeleton className={"max-w-4xl mt-1 mb-4"}/>}

        <div className={"mt-2 flex flex-row gap-1"}>
            {canRegenerate && <Tooltip title={t("datatalk_regenerate")}
                                       asChild={true}>
                <IconButton size={"smallest"} disabled={loading} onClick={onRegenerate}>
                    <LoopIcon size={"smallest"}/>
                </IconButton>
            </Tooltip>}

            <Tooltip title={t("datatalk_copy")}
                     asChild={true}>
                <MessageCopyIcon text={text ?? ""} disabled={loading}/>
            </Tooltip>

            <BadMessageIcon disabled={loading}
                            onFeedback={onFeedback}/>
        </div>

    </>;
}

function MessageCopyIcon({
                             text,
                             disabled
                         }: {
    text: string,
    disabled?: boolean
}) {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (copied) {
            const timeout = setTimeout(() => {
                setCopied(false);
            }, 2000);
            return () => clearTimeout(timeout);
        }
        return undefined;
    }, [copied]);

    return <IconButton size={"smallest"}
                       disabled={disabled}
                       onClick={() => {
                           setCopied(true);
                           navigator.clipboard.writeText(text);
                       }}>
        {copied ? <CheckIcon size={"smallest"}/> : <ContentCopyIcon size={"smallest"}/>}
    </IconButton>;
}

function BadMessageIcon({
                            disabled,
                            onFeedback
                        }: {
    disabled?: boolean,
    onFeedback?: (reason?: FeedbackSlug, feedback?: string) => void,
}) {
    const { t } = useTranslation();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selected, setSelected] = useState<FeedbackSlug | null>(null);
    const [feedbackText, setFeedbackText] = useState<string>("");
    return <>

        <Tooltip title={dialogOpen ? undefined : t("datatalk_bad_response")}
                 asChild={true}>
            <IconButton size={"smallest"}
                        disabled={disabled}
                        onClick={() => {
                            setDialogOpen(true);
                        }}>
                <ThumbDownOffAltIcon size={"smallest"}/>
            </IconButton>
        </Tooltip>
        <Dialog
            maxWidth={"xl"}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onOpenAutoFocus={(e) => {
                e.preventDefault();
            }}>

            <DialogTitle variant={"h6"}>{t("datatalk_what_was_wrong")}</DialogTitle>

            <DialogContent className={"flex flex-col gap-4"}>

                <div className={"flex flex-row gap-2 flex-wrap"}>
                    <FeedbackLabel title={t("datatalk_not_helpful")}
                                   value={"not_helpful"}
                                   selected={selected}
                                   setSelected={setSelected}/>
                    <FeedbackLabel title={t("datatalk_not_factually_correct")}
                                   value={"not_factually_correct"}
                                   selected={selected}
                                   setSelected={setSelected}/>
                    <FeedbackLabel title={t("datatalk_incorrect_code")}
                                   value={"incorrect_code"}
                                   selected={selected}
                                   setSelected={setSelected}/>
                    <FeedbackLabel title={t("datatalk_unsafe_or_problematic")}
                                   value={"unsafe_or_problematic"}
                                   selected={selected}
                                   setSelected={setSelected}/>
                    <FeedbackLabel title={t("datatalk_other")}
                                   value={"other"}
                                   selected={selected}
                                   setSelected={setSelected}/>
                </div>
                <TextField size={"small"}
                           value={feedbackText}
                           onChange={(e) => setFeedbackText(e.target.value)}
                           placeholder={t("datatalk_feedback_details")}></TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setDialogOpen(false);
                    onFeedback?.(selected, feedbackText);
                }}>{t("submit")}</Button>
            </DialogActions>

            <IconButton className={"absolute top-4 right-4"}
                        onClick={() => setDialogOpen(false)}>
                <CloseIcon/>
            </IconButton>
        </Dialog>
    </>;
}

function FeedbackLabel({
                           setSelected,
                           title,
                           value,
                           selected
                       }: {
    value: FeedbackSlug,
    title: string,
    selected: FeedbackSlug,
    setSelected: (value: FeedbackSlug | null) => void
}) {
    return <Label border={true}
                  className={value === selected ? "bg-surface-300 dark:bg-surface-700 hover:bg-surface-300 hover:dark:bg-surface-700" : ""}
                  onClick={() => {
                      setSelected(value);
                  }}>{title}</Label>;
}
