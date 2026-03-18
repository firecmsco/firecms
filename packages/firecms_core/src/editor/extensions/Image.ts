import { cls, defaultBorderMixin } from "@firecms/ui";
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
    let decorationSet = plugin.getState(view.state);

    const placeholder = document.createElement("div");
    const imageElement = document.createElement("img");
    imageElement.setAttribute("class", "opacity-40 rounded-lg border " + defaultBorderMixin);
    imageElement.src = readerEvent.target?.result as string;
    placeholder.appendChild(imageElement);

    const deco = Decoration.widget(pos, placeholder);
    decorationSet = decorationSet?.add(view.state.doc, [deco]);
    view.dispatch(view.state.tr.setMeta(plugin, { decorationSet }));

    // Image Upload Logic
    const src = await upload(image);
    console.debug("Uploaded image", src);

    // Replace placeholder with actual image
    const imageNode = schema.nodes.image.create({ src });
    const tr = view.state.tr.replaceWith(pos, pos, imageNode);

    // Remove placeholder decoration
    decorationSet = decorationSet?.remove([deco]);
    tr.setMeta(plugin, { decorationSet });
    view.dispatch(tr);
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
                            await onFileRead(view as any, readerEvent, position.pos, upload, image);
                        };
                        reader.readAsDataURL(image);
                    });

                    return true;
                }
            },
            handlePaste(view: EditorView, event: ClipboardEvent, slice: any) {
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
                                await onFileRead(view as any, readerEvent, pos, upload, image);
                            };
                            reader.readAsDataURL(image);
                        }
                    });

                return anyImageFound;
            },
            decorations(state) {
                return plugin.getState(state);
            }
        },
        view(editorView) {
            return {
                update(view, prevState) {
                    const prevDecos = plugin.getState(prevState);
                    const newDecos = plugin.getState(view.state);

                    if (prevDecos !== newDecos) {
                        view.updateState(view.state);
                    }
                }
            };
        }
    });

    return plugin;
};


