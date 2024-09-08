import {
    buildCollection,
    buildEnumValueConfig,
    EnumValues,
    Permissions
} from "@firecms/core";

const systemsValues: EnumValues = {
    medico: buildEnumValueConfig({ id: "medico", label: "Medico" }),
    backend: buildEnumValueConfig({ label: "Backend", id: "backend" }),
    specialized_backend: buildEnumValueConfig({
        label: "Specialized Backend",
        id: "specialized_backend"
    }),
    webapp: buildEnumValueConfig({ label: "Web App", id: "webapp" }),
    mobile_app: buildEnumValueConfig({ label: "Mobile App", id: "mobile_app" }),
    cms: buildEnumValueConfig({ label: "CMS", id: "cms" }),
    other: buildEnumValueConfig({ label: "Other", id: "other" })
};

const userEndSystemValues: EnumValues = {
    webapp: buildEnumValueConfig({ label: "Web App", id: "webapp" }),
    mobile_app: buildEnumValueConfig({ label: "Mobile App", id: "mobile_app" }),
    webpage: buildEnumValueConfig({ label: "Web Page", id: "webpage" }),
    marketing: buildEnumValueConfig({ label: "Marketing", id: "marketing" }),
    business: buildEnumValueConfig({ label: "Business", id: "business" }),
};

export type SoftwareRelease = {
    system: string,
    release_date: Date,
    changes: string,
    version: string,
    version_tag: string,
}

export type FeatureRelease = {
    release_date: Date,
    features: string,
    users_affected: string,
    system_affected: string[],
}


export function buildMetaCollection() {
    const softwareReleaseCollection = buildCollection<any>({
        id: "software_releases",
        path: "software_releases",
        name: "Software releases",
        customId: false,
        properties: {
            changes: {
                dataType: "string",
                name: "Changes",
                columnWidth: 640,
                markdown: true
            },
            version: {
                dataType: "string",
                name: "Version"
            },
            version_tag: {
                dataType: "string",
                name: "Version tag",
                longDescription: "An unique tag that identifies the deployment/version of the code."
            },
            system: {
                dataType: "string",
                name: "System affected",
                enumValues: systemsValues
            },
            release_date: {
                dataType: "date",
                name: "Release Date"
            }
        },
        textSearchEnabled: true,
        exportable: true,
        defaultSize: "m",
        singularName: "Software Release"
    });
    const featureReleaseCollection = buildCollection<any>({
        id: "feature_releases",
        path: "feature_releases",
        name: "Feature releases",
        customId: false,
        properties: {
            features: {
                dataType: "string",
                name: "Features",
                columnWidth: 640,
                multiline: true
            },
            users_affected: {
                dataType: "string",
                name: "Group of affected users"
            },
            system_affected: {
                dataType: "array",
                name: "System affected",
                of: {
                    dataType: "string",
                    enumValues: userEndSystemValues,
                }
            },
            release_date: {
                dataType: "date",
                name: "Release Date"
            }
        },
        textSearchEnabled: true,
        exportable: true,
        defaultSize: "m",
        singularName: "Feature Release"
    });

    return [softwareReleaseCollection, featureReleaseCollection];
}





