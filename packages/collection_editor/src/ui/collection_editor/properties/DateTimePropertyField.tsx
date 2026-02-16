import React from "react";
import { getIn, useFormex } from "@firecms/formex";
import { FieldCaption, NumberProperty, StringProperty } from "@firecms/core";
import { Select, SelectItem } from "@firecms/ui";
import { GeneralPropertyValidation } from "./validation/GeneralPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";

// Common IANA timezones with human-readable labels
const TIMEZONES = [
    // UTC
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    // Americas
    { value: "America/New_York", label: "New York (US Eastern)" },
    { value: "America/Chicago", label: "Chicago (US Central)" },
    { value: "America/Denver", label: "Denver (US Mountain)" },
    { value: "America/Los_Angeles", label: "Los Angeles (US Pacific)" },
    { value: "America/Anchorage", label: "Anchorage (Alaska)" },
    { value: "America/Toronto", label: "Toronto (Canada Eastern)" },
    { value: "America/Vancouver", label: "Vancouver (Canada Pacific)" },
    { value: "America/Mexico_City", label: "Mexico City" },
    { value: "America/Sao_Paulo", label: "São Paulo (Brazil)" },
    { value: "America/Buenos_Aires", label: "Buenos Aires (Argentina)" },
    // Europe
    { value: "Europe/London", label: "London (UK)" },
    { value: "Europe/Paris", label: "Paris (France)" },
    { value: "Europe/Berlin", label: "Berlin (Germany)" },
    { value: "Europe/Madrid", label: "Madrid (Spain)" },
    { value: "Europe/Rome", label: "Rome (Italy)" },
    { value: "Europe/Amsterdam", label: "Amsterdam (Netherlands)" },
    { value: "Europe/Brussels", label: "Brussels (Belgium)" },
    { value: "Europe/Zurich", label: "Zurich (Switzerland)" },
    { value: "Europe/Stockholm", label: "Stockholm (Sweden)" },
    { value: "Europe/Vienna", label: "Vienna (Austria)" },
    { value: "Europe/Warsaw", label: "Warsaw (Poland)" },
    { value: "Europe/Prague", label: "Prague (Czech Republic)" },
    { value: "Europe/Athens", label: "Athens (Greece)" },
    { value: "Europe/Moscow", label: "Moscow (Russia)" },
    { value: "Europe/Istanbul", label: "Istanbul (Turkey)" },
    // Asia
    { value: "Asia/Dubai", label: "Dubai (UAE)" },
    { value: "Asia/Kolkata", label: "Mumbai / Delhi (India)" },
    { value: "Asia/Bangkok", label: "Bangkok (Thailand)" },
    { value: "Asia/Singapore", label: "Singapore" },
    { value: "Asia/Hong_Kong", label: "Hong Kong" },
    { value: "Asia/Shanghai", label: "Shanghai (China)" },
    { value: "Asia/Tokyo", label: "Tokyo (Japan)" },
    { value: "Asia/Seoul", label: "Seoul (South Korea)" },
    { value: "Asia/Jakarta", label: "Jakarta (Indonesia)" },
    // Oceania
    { value: "Australia/Sydney", label: "Sydney (Australia Eastern)" },
    { value: "Australia/Melbourne", label: "Melbourne (Australia)" },
    { value: "Australia/Brisbane", label: "Brisbane (Australia)" },
    { value: "Australia/Perth", label: "Perth (Australia Western)" },
    { value: "Pacific/Auckland", label: "Auckland (New Zealand)" },
    // Africa
    { value: "Africa/Cairo", label: "Cairo (Egypt)" },
    { value: "Africa/Johannesburg", label: "Johannesburg (South Africa)" },
    { value: "Africa/Lagos", label: "Lagos (Nigeria)" },
];

export function DateTimePropertyField({ disabled }: {
    disabled: boolean;
}) {

    const {
        values,
        errors,
        touched,
        setFieldValue
    } = useFormex<StringProperty | NumberProperty>();

    const modePath = "mode";
    const modeValue: string | undefined = getIn(values, modePath);
    const modeError: string | undefined = getIn(touched, modePath) && getIn(errors, modePath);

    const autoValuePath = "autoValue";
    const autoValueValue: string | undefined = getIn(values, autoValuePath);
    const autoValueError: string | undefined = getIn(touched, autoValuePath) && getIn(errors, autoValuePath);

    const timezonePath = "timezone";
    const timezoneValue: string | undefined = getIn(values, timezonePath);
    const timezoneError: string | undefined = getIn(touched, timezonePath) && getIn(errors, timezonePath);

    return (
        <>
            <div className={"flex flex-col col-span-12 gap-2"}>
                <div>
                    <Select name={modePath}
                        value={modeValue ?? "date"}
                        error={Boolean(modeError)}
                        size={"large"}
                        onValueChange={(v) => setFieldValue(modePath, v)}
                        label={"Mode"}
                        fullWidth={true}
                        renderValue={(v) => {
                            switch (v) {
                                case "date_time":
                                    return "Date/Time";
                                case "date":
                                    return "Date";
                                default:
                                    return "";
                            }
                        }}
                        disabled={disabled}>
                        <SelectItem value={"date_time"}> Date/Time </SelectItem>
                        <SelectItem value={"date"}> Date </SelectItem>
                    </Select>
                    <FieldCaption error={Boolean(modeError)}>
                        {modeError}
                    </FieldCaption>
                </div>
                <div>
                    <Select name={autoValuePath}
                        disabled={disabled}
                        size={"large"}
                        fullWidth={true}
                        value={autoValueValue ?? ""}
                        onValueChange={(v) => setFieldValue(autoValuePath, v === "none" ? null : v)}
                        renderValue={(v) => {
                            switch (v) {
                                case "on_create":
                                    return "On create";
                                case "on_update":
                                    return "On any update";
                                default:
                                    return "None";
                            }
                        }}
                        error={Boolean(autoValueError)}
                        label={"Automatic value"}>
                        <SelectItem value={"none"}> None </SelectItem>
                        <SelectItem value={"on_create"}> On create </SelectItem>
                        <SelectItem value={"on_update"}> On any update </SelectItem>
                    </Select>
                    <FieldCaption error={Boolean(autoValueError)}>
                        {autoValueError ?? "Update this field automatically when creating or updating the entity"}
                    </FieldCaption>
                </div>
                <div>
                    <Select name={timezonePath}
                        disabled={disabled}
                        size={"large"}
                        fullWidth={true}
                        value={timezoneValue ?? "__local__"}
                        onValueChange={(v) => setFieldValue(timezonePath, v === "__local__" ? undefined : v)}
                        renderValue={(v) => {
                            if (!v || v === "__local__") return "Local timezone";
                            const tz = TIMEZONES.find(t => t.value === v);
                            return tz?.label ?? v;
                        }}
                        error={Boolean(timezoneError)}
                        label={"Timezone"}>
                        <SelectItem value={"__local__"}> Local timezone </SelectItem>
                        {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
                            </SelectItem>
                        ))}
                    </Select>
                    <FieldCaption error={Boolean(timezoneError)}>
                        {timezoneError ?? "Timezone for displaying and inputting dates. Values are always stored in UTC."}
                    </FieldCaption>
                </div>

            </div>

            <div className={"col-span-12"}>
                <ValidationPanel>
                    <GeneralPropertyValidation disabled={disabled} />
                </ValidationPanel>
            </div>
        </>
    );
}
