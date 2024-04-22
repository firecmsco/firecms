export type GCPProjectFirebaseFeature = "DEFAULT_STORAGE" | "FIRESTORE" | "FUNCTIONS";

export const locations = {
    "europe-west": {
        name: "Europe, multi region",
        group: "Europe"
    },
    "us-central": {
        name: "North America, multi region",
        group: "North America"
    },
    "us-west1": {
        name: "Oregon",
        group: "North America"
    },
    "us-west2": {
        name: "Los Angeles",
        group: "North America"
    },
    "us-west3": {
        name: "Salt Lake City",
        group: "North America"
    },
    "us-west4": {
        name: "Las Vegas",
        group: "North America"
    },
    "northamerica-northeast1": {
        name: "Montréal",
        group: "North America"
    },
    "us-east1": {
        name: "South Carolina",
        group: "North America"
    },
    "us-east4": {
        name: "Northern Virginia",
        group: "North America"
    },
    "southamerica-east1": {
        name: "São Paulo",
        group: "South America"
    },
    "europe-west1": {
        name: "Belgium",
        group: "Europe"
    },
    "europe-west2": {
        name: "London",
        group: "Europe"
    },
    "europe-west3": {
        name: "Frankfurt",
        group: "Europe"
    },
    "europe-west6": {
        name: "Zürich",
        group: "Europe"
    },
    "europe-central2": {
        name: "Warsaw",
        group: "Europe"
    },
    "asia-east1": {
        name: "Taiwan",
        group: "Asia"
    },
    "asia-east2": {
        name: "Hong Kong",
        group: "Asia"
    },
    "asia-northeast1": {
        name: "Tokyo",
        group: "Asia"
    },
    "asia-northeast2": {
        name: "Osaka",
        group: "Asia"
    },
    "asia-northeast3": {
        name: "Seoul",
        group: "Asia"
    },
    "asia-south1": {
        name: "Mumbai",
        group: "Asia"
    },
    "asia-southeast1": {
        name: "Singapore",
        group: "Asia"
    },
    "asia-southeast2": {
        name: "Jakarta",
        group: "Asia"
    },
    "australia-southeast1": {
        name: "Sydney",
        group: "Australia"
    }
};

export type GCPProjectLocation = {
    "locationId": keyof typeof locations,
    "type": "REGIONAL" | "MULTI_REGIONAL",
    "features": GCPProjectFirebaseFeature[]
}

export function getFallbackLocations(): GCPProjectLocation[] {
    return Object.keys(locations).map(locationId => ({
        locationId: locationId as keyof typeof locations,
        type: "REGIONAL",
        features: []
    }));
}
