import { cn, FieldConfigBadge, PropertyConfig, SelectItem, Typography } from "@firecms/core";

export interface PropertySelectItemProps {
    value: string;
    optionDisabled: boolean;
    propertyConfig: PropertyConfig;
    existing: boolean;
}

export function PropertySelectItem({ value, optionDisabled, propertyConfig, existing }: PropertySelectItemProps) {
    return <SelectItem value={value}
                       disabled={optionDisabled}
                       className={"flex flex-row items-center"}>
        <div
            className={cn(
                "flex flex-row items-center text-base min-h-[52px]",
                optionDisabled ? "w-full" : "")}>
            <div className={"mr-8"}>
                <FieldConfigBadge propertyConfig={propertyConfig}/>
            </div>
            <div>
                <div>{propertyConfig.name}</div>
                <Typography variant={"caption"}
                            color={"disabled"}
                            className={"max-w-sm"}>
                    {existing && optionDisabled ? "You can only switch to widgets that use the same data type" : propertyConfig.description}
                </Typography>
            </div>
        </div>
    </SelectItem>
}
