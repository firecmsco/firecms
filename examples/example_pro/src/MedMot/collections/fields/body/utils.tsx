


export const isActiveClass = (
    activeParts: string[] | Record<string, "blue-dark" | "blue" | "blue-light">,
    selectedPart: string
) => {
    if (Array.isArray(activeParts)) {
        const included = activeParts.includes(selectedPart);
        if (included) {
            return "active";
        }
    } else if (selectedPart in activeParts) {
        return activeParts[selectedPart];
    }
    return "";
};

export const containerClasses = "h-[420px] w-[500px] mt-3 pr-3 pl-3 flex justify-evenly";
export const itemClasses = "aspect-square max-w-[210px] flex-1";

