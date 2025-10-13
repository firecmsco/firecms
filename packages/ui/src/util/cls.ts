import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cls(...classes: ClassValue[]) {
    return twMerge(clsx(classes));
}

/**
 * @deprecated
 */
export function cn(...classes: ClassValue[]) {
    console.warn("cn() is deprecated, use cls() instead. cn will be removed in the final 3.0.0 version");
    return cls(...classes)
}
