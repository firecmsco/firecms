import { TableSize } from "./TableProps";

export function getRowHeight(size: TableSize): number {
    switch (size) {
        case "xl":
            return 400;
        case "l":
            return 280;
        case "m":
            return 140;
        case "s":
            return 80;
        case "xs":
            return 54;
        default:
            throw Error("Missing mapping for collection size -> height");
    }
}
