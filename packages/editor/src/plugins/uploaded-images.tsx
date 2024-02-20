import {EditorState, Plugin, PluginKey} from "@tiptap/pm/state";
import {Decoration, DecorationSet, EditorView} from "@tiptap/pm/view";

const uploadKey = new PluginKey("upload-image");

export const UploadImagesPlugin = () =>
    new Plugin({
        key: uploadKey,
        state: {
            init() {
                return DecorationSet.empty;
            },
            apply(tr, set) {
                set = set.map(tr.mapping, tr.doc);
                // See if the transaction adds or removes any placeholders
                // @ts-ignore TODO
                const action = tr.getMeta(this);
                if (action && action.add) {
                    const {id, pos, src} = action.add;

                    console.log("plugiin", {id, pos, src})

                    const placeholder = document.createElement("div");
                    placeholder.setAttribute("class", "img-placeholder");
                    const image = document.createElement("img");
                    image.setAttribute("class", "opacity-40 rounded-lg border border-stone-200");
                    image.src = src;
                    placeholder.appendChild(image);
                    const deco = Decoration.widget(pos + 1, placeholder, {
                        id,
                    });
                    set = set.add(tr.doc, [deco]);
                } else if (action && action.remove) {
                    set = set.remove(set.find(undefined, undefined, (spec) => spec.id == action.remove.id));
                }
                return set;
            },
        },
        props: {
            decorations(state) {
                return this.getState(state);
            },
        },
    });

function findPlaceholder(state: EditorState, id: {}) {
    const decos = uploadKey.getState(state);
    const found = decos.find(null, null, (spec: any) => spec.id == id);
    return found.length ? found[0].from : null;
}

interface StartImageUploadParams {
    file: File;
    view: EditorView;
    pos: number;
    handleImageUpload: (file: File) => (Promise<string | ArrayBuffer> | string | ArrayBuffer);
}

export async function startImageUpload({file, view, pos, handleImageUpload}: StartImageUploadParams) {
    // check if the file is an image
    if (!file.type.includes("image/")) {
        return;
    }

    // A fresh object to act as the ID for this upload
    const id = randomString(16);

    // Replace the selection with a placeholder
    const transaction = view.state.tr;
    if (!transaction.selection.empty) transaction.deleteSelection();

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        transaction.setMeta(uploadKey, {
            add: {
                id,
                pos,
                src: reader.result,
            },
        });
        view.dispatch(transaction);
    };

    const src = await handleImageUpload(file);
    const {schema} = view.state;

    console.log({src, view: view.state, id})
    const phPos = findPlaceholder(view.state, id);

    // If the content around the placeholder has been deleted, drop
    // the image
    if (phPos == null) return;

    // Otherwise, insert it at the placeholder's position, and remove
    // the placeholder

    // When BLOB_READ_WRITE_TOKEN is not valid or unavailable, read
    // the image locally
    const imageSrc = typeof src === "object" ? reader.result : src;

    const node = schema.nodes.image.create({src: imageSrc});
    const tr = view.state.tr
        .replaceWith(phPos, phPos, node)
        .setMeta(uploadKey, {remove: {id}});
    view.dispatch(tr);
}

export function randomString(strLength = 5) {
    return Math.random().toString(36).slice(2, 2 + strLength);
}
