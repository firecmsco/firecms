import { GeoPoint } from "../types";

export type GeoPointLike = GeoPoint | {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    _lat?: number;
    _long?: number;
} | null | undefined;

export interface GeoPointCoordinates {
    latitude: number;
    longitude: number;
}

function toNumber(value: any): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function getGeoPointCoordinates(value: GeoPointLike): GeoPointCoordinates | undefined {
    if (!value) return undefined;
    if (value instanceof GeoPoint) {
        return { latitude: value.latitude, longitude: value.longitude };
    }
    if (typeof value !== "object") return undefined;

    const latitude = toNumber((value as any).latitude ?? (value as any).lat ?? (value as any)._lat);
    const longitude = toNumber((value as any).longitude ?? (value as any).lng ?? (value as any)._long);

    if (latitude === undefined || longitude === undefined) return undefined;

    return { latitude, longitude };
}

export function normalizeGeoPoint(value: GeoPointLike): GeoPoint | undefined {
    const coordinates = getGeoPointCoordinates(value);
    if (!coordinates) return undefined;
    if (value instanceof GeoPoint) return value;
    return new GeoPoint(coordinates.latitude, coordinates.longitude);
}

export function formatGeoPoint(value: GeoPointLike, options?: { maximumFractionDigits?: number }): string {
    const coordinates = getGeoPointCoordinates(value);
    if (!coordinates) return "";

    const maximumFractionDigits = options?.maximumFractionDigits ?? 6;
    const formatter = new Intl.NumberFormat(undefined, {
        maximumFractionDigits,
        minimumFractionDigits: Math.min(2, maximumFractionDigits)
    });

    return `${formatter.format(coordinates.latitude)}, ${formatter.format(coordinates.longitude)}`;
}

export function parseGeoPoint(input: string): { point: GeoPoint | null; error?: string } {
    const trimmed = input.trim();
    if (!trimmed) return { point: null };

    const parts = trimmed.split(",").map((part) => part.trim()).filter((part) => part !== "");
    if (parts.length !== 2) return { point: null, error: "Use \"lat, lng\" format" };

    const latitude = parseFloat(parts[0]);
    const longitude = parseFloat(parts[1]);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return { point: null, error: "Latitude and longitude must be numbers" };
    }
    if (latitude < -90 || latitude > 90) {
        return { point: null, error: "Latitude must be between -90 and 90" };
    }
    if (longitude < -180 || longitude > 180) {
        return { point: null, error: "Longitude must be between -180 and 180" };
    }

    return { point: new GeoPoint(latitude, longitude) };
}
