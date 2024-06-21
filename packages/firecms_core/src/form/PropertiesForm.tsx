import { FormContext, PropertiesOrBuilders, PropertyFieldBindingProps } from "../types";
import { Tooltip } from "@firecms/ui";
import { PropertyIdCopyTooltipContent } from "../components/PropertyIdCopyTooltipContent";
import { PropertyFieldBinding } from "./PropertyFieldBinding";
import { ErrorBoundary } from "../components";
import { isHidden, isReadOnly, resolveProperties } from "../util";
import { FormexController } from "@firecms/formex";

export type PropertiesFormProps<M extends Record<string, any> = Record<string, any>> = {
    properties: PropertiesOrBuilders<M>;
    propertiesOrder?: string[];
    formex: FormexController<M>;
}

export function PropertiesForm<M extends Record<string, any> = Record<string, any>>({
                                                                                        properties,
                                                                                        propertiesOrder,
                                                                                        formex
                                                                                    }: PropertiesFormProps<M>) {

    const resolvedProperties = resolveProperties({ properties });

    const formContext: FormContext<M> = {
        // @ts-ignore
        setFieldValue: useCallback(formex.setFieldValue, []),
        values: formex.values ?? {},
        // @ts-ignore
        save: useCallback(() => {
            throw new Error("Not implemented. You currently can't call save from a custom field, within a PropertiesForm (it works in standard Entity forms)");
        }, []),
        formex
    };

    const formFields = (
        <div className={"flex flex-col gap-8"}>
            {(propertiesOrder ?? Object.keys(resolvedProperties))
                .map((key) => {

                    const property = resolvedProperties[key];
                    if (!property) {
                        console.warn(`Property ${key} not found in collection PropertiesForm`);
                        return null;
                    }

                    const disabled = formex.isSubmitting || isReadOnly(property) || Boolean(property.disabled);
                    const hidden = isHidden(property);
                    if (hidden) return null;
                    const cmsFormFieldProps: PropertyFieldBindingProps<any, M> = {
                        propertyKey: key,
                        disabled,
                        property,
                        includeDescription: property.description || property.longDescription,
                        context: formContext,
                        tableMode: false,
                        partOfArray: false,
                        partOfBlock: false,
                        autoFocus: false
                    };

                    return (
                        <div id={`form_field_${key}`}
                             key={`field_${key}`}>
                            <ErrorBoundary>
                                <Tooltip title={<PropertyIdCopyTooltipContent propertyId={key}/>}
                                         delayDuration={800}
                                         side={"left"}
                                         align={"start"}
                                         sideOffset={16}>
                                    <PropertyFieldBinding {...cmsFormFieldProps}/>
                                </Tooltip>
                            </ErrorBoundary>
                        </div>
                    );
                })
                .filter(Boolean)}

        </div>
    );

    return <div></div>
}
