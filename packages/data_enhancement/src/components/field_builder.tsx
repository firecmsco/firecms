import React, { useMemo, useState } from "react";
import equal from "react-fast-compare"

import { CMSType, FieldProps, MarkdownEditorFieldBinding, PluginFieldBuilderParams, } from "@firecms/core";
import {
    AutoAwesomeIcon,
    CircularProgress,
    cls,
    IconButton,
    Menu,
    MenuItem,
    SendIcon,
    TextField,
    Tooltip,
    Typography
} from "@firecms/ui";
import { useDataEnhancementController } from "./DataEnhancementControllerProvider";
import { SUPPORTED_FIELDS_ENHANCEMENT } from "../utils/fields";
import { EnhanceTextFieldBinding } from "./fields/EnhanceTextField";
import { EnhancedDataResult, EnhanceParams } from "../types/data_enhancement_controller";
import { countStringCharacters } from "../utils/strings_counter";
import { EditorAIController } from "@firecms/editor";

export function fieldBuilder<T extends CMSType = CMSType>
(params: PluginFieldBuilderParams<T>): React.ComponentType<FieldProps<T>> | null {

    const {
        fieldConfigId,
        property
    } = params;

    const wrappedComponent = React.useMemo(() => function FieldWrapper(props: FieldProps<T, any, any>) {

        const {
            enabled,
            suggestions,
            enhance,
            loadingSuggestions,
            editorAIController
        } = useDataEnhancementController();

        const loading = loadingSuggestions?.includes(props.propertyKey);
        const suggestedValue = suggestions?.[props.propertyKey];

        const filledCharacters = countStringCharacters(props.context.values, props.context.collection?.properties ?? {});
        const enoughData = filledCharacters > 5;

        return <FieldInner
            loading={loading}
            props={props as FieldProps}
            suggestedValue={suggestedValue}
            enabled={enabled}
            enoughData={enoughData}
            Field={params.Field as React.ComponentType<FieldProps>}
            enhance={enhance}
            editorAIController={editorAIController}/>

    }, []);

    if (property.disabled || property.readOnly || property.Field) {
        return null;
    }

    if (SUPPORTED_FIELDS_ENHANCEMENT.includes(fieldConfigId)) {
        return wrappedComponent;
    }
    return null;
}

interface FieldInnerParams<T extends CMSType = CMSType, M extends Record<string, any> = any> {
    loading: boolean;
    props: FieldProps<T, any, M>;
    suggestedValue: string | number;
    enabled: boolean;
    enoughData: boolean;
    Field: React.ComponentType<FieldProps<T, any, M>>;
    enhance: (props: EnhanceParams<M>) => Promise<EnhancedDataResult | null>;
    editorAIController?: EditorAIController;
}

const FieldInner = React.memo(function FieldInner<T extends CMSType = CMSType, M extends Record<string, any> = any>({
                                                                                                                        loading,
                                                                                                                        props,
                                                                                                                        suggestedValue,
                                                                                                                        enabled,
                                                                                                                        enoughData,
                                                                                                                        Field,
                                                                                                                        enhance,
                                                                                                                        editorAIController
                                                                                                                    }: FieldInnerParams<T, M>) {

    const [dataLoading, setDataLoading] = useState(false);

    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [propertyInstructions, setPropertyInstructions] = useState<string>();

    const property = props.property;
    const topClass = useMemo(() => {
        if (property.widthPercentage !== undefined) {
            return "top-4";
        } else {
            if (property.dataType === "array" && property.of?.dataType === "string") {
                return "top-4";
            }
            return property.dataType === "string" && property.markdown ? "top-3" : "-top-4";
        }
    }, []);

    const rightClass = props.partOfArray ? "right-12" : "right-2";

    if (!enabled) {
        return <Field {...props} />
    }

    const showEnhanceIcon = !props.disabled && (
        !props.value
        || (property.dataType === "string" && (property.multiline || property.markdown))
        || (property.dataType === "array" && property.of?.dataType === "string")
    );

    const indexOfSuggestion = props.value && typeof props.value === "string" && typeof suggestedValue === "string" && props.value.endsWith(suggestedValue) ?
        props.value.indexOf(suggestedValue) + 1 : undefined;

    const highlightRange = indexOfSuggestion && typeof suggestedValue === "string" ? {
        from: indexOfSuggestion,
        to: suggestedValue.length + indexOfSuggestion
    } : undefined;

    let fieldBinding: React.ReactElement;
    if (property.dataType === "string" && property.markdown) {
        fieldBinding = <MarkdownEditorFieldBinding {...props as FieldProps<any>}
                                                   customProps={{
                                                       highlight: highlightRange,
                                                       editorProps: {
                                                           aiController: editorAIController,
                                                       }
                                                   }}/>;
    } else if (property.dataType === "string" && !property.enumValues) {
        fieldBinding = <EnhanceTextFieldBinding {...props as FieldProps<any>}
                                                highlight={suggestedValue as string}/>;
    } else {
        fieldBinding = <Field {...props} />;
    }

    const enhanceData = (instructions?: string) => {
        if (!props.context.entityId) return;
        if (!enoughData) return;
        setMenuOpen(false);
        setDataLoading(true);
        return enhance({
            entityId: props.context.entityId,
            propertyKey: props.propertyKey,
            propertyInstructions: instructions,
            values: props.context.values,
            replaceValues: false
        }).finally(() => setDataLoading(false));
    };

    const allowInstructions = property.dataType === "string" && !property.enumValues;

    return <>

        {fieldBinding}

        {showEnhanceIcon && <div className={cls("dark:bg-surface-700 bg-surface-100 rounded-full absolute",
            rightClass,
            topClass)}>
            <Tooltip
                open={tooltipOpen}
                onOpenChange={setTooltipOpen}
                side={"left"}
                asChild={false}
                title={enoughData
                    ? `Autofill ${property.name ?? "this field"}`
                    : `You need to input some data in the form before enhancing ${property.name ?? "this field"}`}>
                <Menu
                    open={menuOpen}
                    onOpenChange={setMenuOpen}
                    trigger={
                        <IconButton
                            size="small"
                            aria-label="Enhance field"
                            disabled={dataLoading || loading}
                            className={enoughData ? "text-surface-900 dark:text-white" : "text-surface-400 dark:text-surface-600"}
                            onClick={() => {
                                if (!props.context.entityId) return;
                                if (!enoughData) return;
                                setTooltipOpen(false);
                                setDataLoading(true);
                                return enhance({
                                    entityId: props.context.entityId,
                                    propertyKey: props.propertyKey,
                                    values: props.context.values,
                                    replaceValues: false
                                }).finally(() => setDataLoading(false));
                            }}>
                            {dataLoading || loading
                                ? <CircularProgress size={"smallest"}/>
                                : <AutoAwesomeIcon
                                    size={"small"}/>}
                        </IconButton>}>
                    <MenuItem onClick={() => enhanceData()}>
                        <AutoAwesomeIcon size="small"/>
                        <div className={"flex flex-col"}>
                            <Typography
                                variant={"body2"}> {`Autofill ${property.name ?? "this field"}`}</Typography>
                            <Typography variant={"caption"}>based on the rest of the entity</Typography>
                        </div>
                    </MenuItem>

                    {allowInstructions && <div className={"p-4"}>
                        <TextField label={"Ask AI to write"}
                                   size={"small"}
                                   className={"w-[400px] max-w-full text-text-primary dark:text-text-primary-dark"}
                                   value={propertyInstructions ?? ""}
                                   onKeyDown={(e) => {
                                       if (e.key === "Enter") {
                                           enhanceData(propertyInstructions);
                                       }
                                   }}
                                   placeholder={"Instructions"}
                                   onChange={(e) => setPropertyInstructions(e.target.value)}
                                   endAdornment={<IconButton
                                       size={"small"}
                                       onClick={() => enhanceData(propertyInstructions)}
                                       disabled={!propertyInstructions}>
                                       <SendIcon size={"small"}/>
                                   </IconButton>}>
                        </TextField>
                    </div>}

                </Menu>

            </Tooltip>
        </div>}

    </>
}, (prevProps, nextProps) => {
    return prevProps.loading === nextProps.loading &&
        prevProps.suggestedValue === nextProps.suggestedValue &&
        prevProps.enabled === nextProps.enabled &&
        prevProps.props.value === nextProps.props.value &&
        prevProps.props.error === nextProps.props.error &&
        prevProps.props.showError === nextProps.props.showError &&
        prevProps.props.disabled === nextProps.props.disabled &&
        equal(prevProps.props.property, nextProps.props.property) &&
        prevProps.Field === nextProps.Field &&
        prevProps.enoughData === nextProps.enoughData;
});
