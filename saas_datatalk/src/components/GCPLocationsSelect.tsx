import React, { useCallback, useEffect, useState } from "react";
import { CircularProgress, PriorityHighIcon, Select, SelectGroup, SelectItem, Tooltip, Typography } from "@firecms/ui";

import { fetchGCPLocations } from "../api/gcp_projects";
import { GCPProjectLocation, locations } from "../types/gcp_locations";
import { FieldCaption } from "@firecms/cloud";
import { ServiceAccount } from "../types/service_account";

type GCPLocationAndName = GCPProjectLocation & { name: string, group: string };

function getLocationTooltip(location: GCPLocationAndName) {
    const region = location.type === "REGIONAL" ? "Regional" : (location.type === "MULTI_REGIONAL" ? "Multi-regional" : "unknown");
    const features = location.features.map(f => {
        switch (f) {
            case "DEFAULT_STORAGE":
                return "Cloud storage";
            case "FIRESTORE":
                return "Firestore";
            case "FUNCTIONS":
                return "Functions";
        }
        return f;
    })
    return `${region}: ${features.join(", ")}`;
}

const locationGroups = ["Europe", "North America", "Asia", "Australia", "South America", "Other"];

function getLocationGroup(location: GCPProjectLocation) {
    const namePrefix = location.locationId.split("-")[0];
    if (namePrefix)
        switch (namePrefix) {
            case "europe":
                return "Europe";
            case "asia":
                return "Asia";
            case "northamerica":
            case "us":
                return "North America";
            case "australia":
                return "Australia";
            case "southamerica":
                return "South America";
        }
    return "Other";
}

export function GCPLocationsSelect({
                                       value,
                                       onValueChange,
                                       error,
                                       accessToken,
                                       serviceAccount,
                                       disabled
                                   }: {
    value?: string,
    onValueChange: (locationId: string) => void,
    error?: string,
    accessToken?: string,
    serviceAccount?: ServiceAccount,
    disabled?: boolean
}) {

    const [loadedLocations, setLoadedLocations] = useState<GCPLocationAndName[] | undefined>();

    const loadLocations = useCallback(() => {
        fetchGCPLocations(accessToken, serviceAccount).then(fetchLocations => {
            fetchLocations.sort((a, b) => a.locationId.localeCompare(b.locationId));
            const locationsWithNames = fetchLocations
                .filter(location => location.type !== "MULTI_REGIONAL")
                .map(location => {
                    const extra = locations[location.locationId];
                    if (!extra) console.error("No extra info for location", location);
                    return {
                        ...location,
                        name: extra?.name,
                        group: getLocationGroup(location) ?? extra?.group ?? "Other"
                    }
                });
            return setLoadedLocations(locationsWithNames);
        });
    }, []);

    useEffect(() => {
        loadLocations();
    }, [loadLocations]);

    const groups: string[] = [];
    (loadedLocations ?? []).map(location => location.group).forEach((element) => {
        if (!groups.includes(element)) {
            groups.push(element);
        }
    });
    groups.sort((a, b) => locationGroups.indexOf(a) - locationGroups.indexOf(b));

    return (
        <>

            <Select
                error={Boolean(error)}
                name={"locationId"}
                value={value ?? ""}
                position={"item-aligned"}
                onChange={(event) => onValueChange(event.target.value as string)}
                label={"Location"}
                disabled={disabled}
                renderValue={(selected) => {
                    if (loadedLocations === undefined)
                        return <CircularProgress size={"small"}/>;
                    const location = (loadedLocations ?? []).find(location => location.locationId === selected);
                    if (!location) return null;
                    return <GCPLocationMenuItem locationId={location.locationId}
                                                name={location.name}
                                                caution={!location.features.includes("FUNCTIONS") ? "Cloud Functions are not available in this location" : undefined}/>
                }}>

                {groups.map(group => {
                    return [
                        <SelectGroup key={group}
                                     label={group}>
                            {...(loadedLocations ?? []).filter(location => location.group === group).map(location => {
                                return (
                                    <SelectItem
                                        key={location.locationId}
                                        value={location.locationId}>
                                        <GCPLocationMenuItem
                                            locationId={location.locationId}
                                            name={location.name}
                                            caution={!location.features.includes("FUNCTIONS") ? "Cloud Functions are not available in this location" : undefined}/>
                                    </SelectItem>
                                )
                            })}
                        </SelectGroup>,
                    ];
                })}

            </Select>
            <FieldCaption>
                You will not be able to change the location later.
            </FieldCaption>
        </>
    );
}

function GCPLocationMenuItem({
                                 locationId,
                                 name,
                                 caution
                             }: { locationId: string, name: string, caution?: string }) {
    return <div className="w-full flex flex-row gap-2 justify-between items-center">
        <Typography
            className={"flex-grow text-left"}
            variant={"subtitle2"}>
            {name}
        </Typography>

        {caution && <Tooltip title={caution}>
            <PriorityHighIcon
                color={"warning"}
                size={"small"}/>
        </Tooltip>}
        <Typography
            variant={"body2"}>
            {locationId}
        </Typography>
    </div>;
}
