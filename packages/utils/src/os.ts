export function getOS() {
    let OS = "Unknown";
    if (navigator.userAgent.indexOf("Win") !== -1) OS = "Windows";
    if (navigator.userAgent.indexOf("Mac") !== -1) OS = "MacOS";
    if (navigator.userAgent.indexOf("X11") !== -1) OS = "UNIX";
    if (navigator.userAgent.indexOf("Linux") !== -1) OS = "Linux";
    return OS;
}

export function getAltSymbol() {
    if (getOS() === "MacOS") return "⌥";
    return "Alt";
}
