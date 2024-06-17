import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cls(...classes: ClassValue[]) {
    return twMerge(clsx(classes))
}
