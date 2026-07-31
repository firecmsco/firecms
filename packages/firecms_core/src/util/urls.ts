import type { PreviewType } from "../types";

const ABSOLUTE_HTTP_URL_REGEX = /^https?:\/\//i;

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp", "svg", "ico", "tif", "tiff", "heic", "heif"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogv", "mov", "m4v", "avi", "mkv", "mpeg", "mpg", "3gp"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "oga", "m4a", "aac", "flac", "weba", "opus", "mid", "midi"];

/**
 * Is the given value an absolute `http(s)` URL, as opposed to a relative
 * storage path such as `images/my_image.png`?
 *
 * Values saved in the datasource for storage properties can be either, e.g.
 * when the property is configured with `storeUrl: true`, or when the value was
 * written directly pointing to an externally hosted file.
 */
export function isAbsoluteHttpUrl(value?: string | null): boolean {
    if (!value) return false;
    return ABSOLUTE_HTTP_URL_REGEX.test(value);
}

/**
 * Extract the lowercase file extension of a URL or path, ignoring any query
 * string or hash fragment. Returns `undefined` when there is no extension.
 */
export function getFileExtensionFromUrl(urlOrPath?: string | null): string | undefined {
    if (!urlOrPath) return undefined;
    // Query strings and hash fragments are not part of the file name, and they
    // are common in download URLs, e.g. `?alt=media&token=...`
    const withoutQuery = urlOrPath.split(/[?#]/)[0];
    const lastSegment = withoutQuery.split("/").pop();
    if (!lastSegment) return undefined;
    const lastDot = lastSegment.lastIndexOf(".");
    // No dot, a leading dot (a dotfile), or a trailing dot means no extension
    if (lastDot <= 0 || lastDot === lastSegment.length - 1) return undefined;
    return lastSegment.substring(lastDot + 1).toLowerCase();
}

/**
 * Best effort guess of the preview type of a URL or path, based on its file
 * extension. Used when no storage metadata (and therefore no content type) is
 * available, e.g. for externally hosted files.
 * Returns `undefined` when the extension is missing or not recognised.
 */
export function getPreviewTypeFromUrl(urlOrPath?: string | null): PreviewType | undefined {
    const extension = getFileExtensionFromUrl(urlOrPath);
    if (!extension) return undefined;
    if (IMAGE_EXTENSIONS.includes(extension)) return "image";
    if (VIDEO_EXTENSIONS.includes(extension)) return "video";
    if (AUDIO_EXTENSIONS.includes(extension)) return "audio";
    return undefined;
}
