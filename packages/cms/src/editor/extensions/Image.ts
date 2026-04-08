import { cls, defaultBorderMixin } from "@rebasepro/ui";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { Plugin, PluginKey } from "prosemirror-state";

export type UploadFn = (image: File) => Promise<string>;

export async function onFileRead(view: EditorView, readerEvent: ProgressEvent<FileReader>, pos: number, upload: UploadFn, image: File) {

    const { schema } = view.state;

    // @ts-ignore
    const plugin = view.state.plugins.find((p: Plugin) => p.key === ImagePluginKey.key);
    if (!plugin) {
        console.error("Image plugin not found");
        return;
    }

    const decoId = Math.random().toString(36).substring(7);
    const placeholder = document.createElement("div");
    const imageElement = document.createElement("img");
    imageElement.setAttribute("class", "opacity-40 rounded-lg border " + defaultBorderMixin);
    imageElement.src = readerEvent.target?.result as string;
    placeholder.appendChild(imageElement);

    const deco = Decoration.widget(pos, placeholder, { id: decoId });
    let decorationSet = plugin.getState(view.state);
    decorationSet = decorationSet?.add(view.state.doc, [deco]);
    view.dispatch(view.state.tr.setMeta(plugin, { decorationSet }));

    // Image Upload Logic
    const src = await upload(image);
    console.debug("Uploaded image", src);

    const replacePlaceholder = () => {
        // Retrieve the LATEST state after the async upload
        let currentDecos = plugin.getState(view.state) as DecorationSet;
        const foundDecos = currentDecos.find(undefined, undefined, spec => spec.id === decoId);
        
        if (foundDecos.length === 0) {
            console.warn("Image placeholder removed before upload completed.");
            return;
        }
        
        // Get the mapped position of the decoration
        const currentPos = foundDecos[0].from;

        // Replace placeholder with actual image at the correct mapped position
        const imageNode = view.state.schema.nodes.image.create({ src });
        const tr = view.state.tr.replaceWith(currentPos, currentPos, imageNode);

        // Remove placeholder decoration using the LATEST decorationSet
        currentDecos = currentDecos.remove(foundDecos);
        tr.setMeta(plugin, { decorationSet: currentDecos });
        view.dispatch(tr);
    };

    // Preload the image so it doesn't cause a layout shift when replacing the placeholder
    const preloader = new Image();
    preloader.src = src;
    preloader.onload = replacePlaceholder;
    preloader.onerror = replacePlaceholder;
}

export const ImagePluginKey = new PluginKey("imagePlugin");

export const createDropImagePlugin = (upload: UploadFn): Plugin => {
    const plugin: Plugin = new Plugin({
        key: ImagePluginKey,
        state: {
            // Initialize the plugin state with an empty DecorationSet
            init: () => DecorationSet.empty,
            // Apply transactions to update the state
            apply: (tr, old) => {
                // Handle custom transaction steps that update decorations
                const meta = tr.getMeta(plugin);
                if (meta && meta.decorationSet) {
                    return meta.decorationSet;
                }
                // Map decorations to the new document structure
                return old.map(tr.mapping, tr.doc);
            }
        },
        props: {
            handleDOMEvents: {
                dragover: (view: EditorView, event: DragEvent) => {
                    if (event.dataTransfer?.types?.includes("Files")) {
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
                drop: (view: EditorView, event: DragEvent) => {
                    if (!event.dataTransfer?.files || event.dataTransfer?.files.length === 0) {
                        return false;
                    }
                    event.preventDefault();

                    const files = Array.from(event.dataTransfer.files);
                    const images = files.filter(file => /image/i.test(file.type));

                    if (images.length === 0) {
                        console.log("No images found in dropped files");
                        return false;
                    }

                    images.forEach(image => {
                        const position = view.posAtCoords({
                            left: event.clientX,
                            top: event.clientY
                        });
                        if (!position) return;

                        const reader = new FileReader();
                        reader.onload = async (readerEvent) => {
                            await onFileRead(view, readerEvent, position.pos, upload, image);
                        };
                        reader.readAsDataURL(image);
                    });

                    return true;
                }
            },
            handlePaste(view: EditorView, event: ClipboardEvent) {
                const html = event.clipboardData?.getData("text/html");
                if (html && html.includes("<img")) {
                    // Let ProseMirror handle the HTML paste natively (e.g. copy-pasted from the editor itself or a webpage)
                    return false;
                }

                const items = Array.from(event.clipboardData?.items || []);
                const pos = view.state.selection.from;
                let anyImageFound = false;

                items
                    .filter((item) => item.type.startsWith("image/"))
                    .forEach((item) => {
                        const image = item.getAsFile();
                        if (image) {
                            anyImageFound = true;
                            const reader = new FileReader();
                            reader.onload = async (readerEvent) => {
                                await onFileRead(view, readerEvent, pos, upload, image);
                            };
                            reader.readAsDataURL(image);
                        }
                    });

                return anyImageFound;
            },
            decorations(state) {
                return plugin.getState(state);
            }
        }
    });

    return plugin;
};


