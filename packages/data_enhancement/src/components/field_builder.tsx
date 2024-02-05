import React, { useState } from "react";
import equal from "react-fast-compare"

import { CMSType, FieldProps, PluginFieldBuilderParams, } from "@firecms/core";
import {
    AutoAwesomeIcon,
    CircularProgress,
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

export function fieldBuilder<T extends CMSType = CMSType>
(params: PluginFieldBuilderParams<T>): React.ComponentType<FieldProps<T>> | null {

    const {
        fieldConfigId,
        property
    } = params;

    if (property.disabled || property.readOnly || property.Field) {
        return null;
    }

    if (SUPPORTED_FIELDS_ENHANCEMENT.includes(fieldConfigId))
        return builder(params);

    return null;
}

function builder<T extends CMSType = CMSType, M extends Record<string, any> = any>({
                                                                                       fieldConfigId,
                                                                                       Field
                                                                                   }: PluginFieldBuilderParams<T, M>): React.ComponentType<FieldProps<T>> {

    return function FieldWrapper(props: FieldProps<T, any, M>) {

        const {
            enabled,
            suggestions,
            enhance,
            loadingSuggestions
        } = useDataEnhancementController();

        const loading = loadingSuggestions?.includes(props.propertyKey);
        const suggestedValue = suggestions?.[props.propertyKey];

        const filledCharacters = countStringCharacters(props.context.values, props.context.collection.properties);
        const enoughData = filledCharacters > 5;

        return <FieldInner
            loading={loading}
            props={props as FieldProps}
            suggestedValue={suggestedValue}
            enabled={enabled}
            enoughData={enoughData}
            Field={Field as React.ComponentType<FieldProps>}
            enhance={enhance}/>

    };
}

interface FieldInnerParams<T extends CMSType = CMSType, M extends Record<string, any> = any> {
    loading: boolean;
    props: FieldProps<T, any, M>;
    suggestedValue: string | number;
    enabled: boolean;
    enoughData: boolean;
    Field: React.ComponentType<FieldProps<T, any, M>>;
    enhance: (props: EnhanceParams<M>) => Promise<EnhancedDataResult>;
}

const FieldInner = React.memo(function FieldInner<T extends CMSType = CMSType, M extends Record<string, any> = any>({
                                                                                                                        loading,
                                                                                                                        props,
                                                                                                                        suggestedValue,
                                                                                                                        enabled,
                                                                                                                        enoughData,
                                                                                                                        Field,
                                                                                                                        enhance
                                                                                                                    }: FieldInnerParams<T, M>) {

    const [dataLoading, setDataLoading] = useState(false);

    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [propertyInstructions, setPropertyInstructions] = useState<string>();

    if (!enabled) {
        // @ts-ignore
        return <Field {...props} />
    }

    const showEnhanceIcon = !props.disabled && (!props.value || (props.property.dataType === "string" && (props.property.multiline || props.property.markdown)));

    const shouldUseAdvancedField = props.property.dataType === "string" && (!props.property.enumValues && !props.property.markdown);
    const fieldBinding = shouldUseAdvancedField
        ? <EnhanceTextFieldBinding {...props as FieldProps<any>}
                                   highlight={suggestedValue as string}/>
        : <Field {...props} />;

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

    const allowInstructions = props.property.dataType === "string" && !props.property.enumValues;

    return <div className={"relative"}>

        {fieldBinding}

        {showEnhanceIcon && <div className={"dark:bg-gray-700 bg-gray-100 rounded-full absolute right-2 -top-4"}>
            <Tooltip
                open={tooltipOpen}
                onOpenChange={setTooltipOpen}
                side={"left"}
                title={enoughData
                    ? `Autofill ${props.property.name ?? "this field"}`
                    : `You need to input some data in the form before enhancing ${props.property.name ?? "this field"}`}>
                <Menu
                    open={menuOpen}
                    onOpenChange={setMenuOpen}
                    trigger={
                        <IconButton
                            size="small"
                            aria-label="Enhance field"
                            disabled={dataLoading || loading}
                            className={enoughData ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}
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
                                ? <CircularProgress size={"small"}/>
                                : <AutoAwesomeIcon
                                    size={"small"}/>}
                        </IconButton>}
                >
                    <MenuItem onClick={() => enhanceData()}>
                        <AutoAwesomeIcon
                            size="small"/>
                        <div className={"flex flex-col"}>
                            <Typography
                                variant={"body2"}> {`Autofill ${props.property.name ?? "this field"}`}</Typography>
                            <Typography variant={"caption"}>based on the rest of the entity</Typography>
                        </div>
                    </MenuItem>

                    {allowInstructions && <div className={"p-4"}>
                        <TextField label={"Ask AI to write"}
                                   size={"small"}
                                   className={"w-[400px] max-w-full"}
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

    </div>
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
