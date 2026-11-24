/**
 * CSS custom properties the header writes on the table's root element, so
 * that the body follows a gesture without React drawing a single cell.
 *
 * Keyed by column index, not key: a key is arbitrary text and not a valid
 * custom-property name, and neither gesture can reorder the columns while it
 * runs (a drag reorders them only once it is dropped).
 */

/** A column's width while its edge is being dragged, cleared once the drag is committed. */
export const columnWidthVar = (index: number) => `--vt-w-${index}`;

/**
 * Clips a column's cells while its edge is dragged: a renderer that sizes its
 * content from the `width` it was given keeps that width until the edge is let
 * go, and shrinking the column would otherwise draw it over the next one.
 */
export const columnClipVar = (index: number) => `--vt-clip-${index}`;

/** How far a column has moved while a column drag is under way. */
export const columnShiftVar = (index: number) => `--vt-shift-${index}`;

/** The transition dnd-kit gives that movement. */
export const columnTransitionVar = (index: number) => `--vt-transition-${index}`;

/** The width a column is drawn at: the live one during a resize, its own otherwise. */
export function columnWidth(index: number, width: number): string {
    return `var(${columnWidthVar(index)}, ${width}px)`;
}
