import { Plugin, } from "prosemirror-state";
import { TiptapImage } from "./index";
import { cn, defaultBorderMixin } from "@firecms/ui";
import { Decoration, DecorationSet, EditorView } from "@tiptap/pm/view";

export type UploadFn = (image: File) => Promise<string>;

async function onFileRead(plugin: Plugin, view: EditorView, readerEvent: ProgressEvent<FileReader>, pos: number, upload: UploadFn, image: File) {

    const { schema } = view.state;
    let decorationSet = plugin.getState(view.state);

    const placeholder = document.createElement("div");
    const imageElement = document.createElement("img");
    imageElement.setAttribute("class", "opacity-40 rounded-lg border border-stone-200");
    imageElement.src = readerEvent.target?.result as string;
    placeholder.appendChild(imageElement);

    const deco = Decoration.widget(pos, placeholder);
    decorationSet = decorationSet?.add(view.state.doc, [deco]);
    view.dispatch(view.state.tr.setMeta(plugin, { decorationSet }));

    // Image Upload Logic
    const src = await upload(image);
    console.log("uploaded image", src);

    // Replace placeholder with actual image
    const imageNode = schema.nodes.image.create({ src });
    const tr = view.state.tr.replaceWith(pos, pos, imageNode);

    // Remove placeholder decoration
    decorationSet = decorationSet?.remove([deco]);
    tr.setMeta(plugin, { decorationSet });
    view.dispatch(tr);
}

export const dropImagePlugin = (upload: UploadFn) => {
    const plugin: Plugin = new Plugin({
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
                drop: (view, event) => {
                    console.log("drop event", event)
                    if (!event.dataTransfer?.files || event.dataTransfer?.files.length === 0) {
                        return false;
                    }
                    event.preventDefault();

                    const files = Array.from(event.dataTransfer.files);
                    const images = files.filter(file => /image/i.test(file.type));

                    if (images.length === 0) return false;

                    images.forEach(image => {

                        const position = view.posAtCoords({ left: event.clientX, top: event.clientY });
                        if (!position) return;

                        const reader = new FileReader();
                        reader.onload = async (readerEvent) => {
                            await onFileRead(plugin, view, readerEvent, position.pos, upload, image);
                        };
                        reader.readAsDataURL(image);
                    });

                    return true;
                }
            },
            handlePaste(view, event, slice) {
                const items = Array.from(event.clipboardData?.items || []);
                const pos = view.state.selection.from;
                console.log("pos", pos)
                let anyImageFound = false;

                items.forEach((item) => {
                    const image = item.getAsFile();
                    console.log("image", image);
                    if (image) {
                        anyImageFound = true;
                        // if (item.type.indexOf("image") === 0) {
                        //     event.preventDefault();
                        //
                        //     if (upload && image) {
                        //         upload(image).then((src) => {
                        //             const node = schema.nodes.image.create({
                        //                 src
                        //             });
                        //             const transaction = view.state.tr.replaceSelectionWith(node);
                        //             view.dispatch(transaction);
                        //         });
                        //     }
                        // } else {
                        const reader = new FileReader();

                        reader.onload = async (readerEvent) => {
                            await onFileRead(plugin, view, readerEvent, pos, upload, image);
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
            // This is needed to immediately apply the decoration updates
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

/**
 * Matches following attributes in Markdown-typed image: [, alt, src, title]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "Ipsum") -> [, "", "image.jpg", "Ipsum"]
 * ![Lorem](image.jpg "Ipsum") -> [, "Lorem", "image.jpg", "Ipsum"]
 */
const IMAGE_INPUT_REGEX = /!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const createImageExtension = (uploadFn: UploadFn) => {
    return TiptapImage.extend({
        addProseMirrorPlugins() {
            return [dropImagePlugin(uploadFn)];
        }
    }).configure({
        allowBase64: true,
        HTMLAttributes: {
            class: cn("rounded-lg border", defaultBorderMixin)
        }
    });
};
