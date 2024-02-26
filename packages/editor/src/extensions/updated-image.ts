import Image from "@tiptap/extension-image";

const UpdatedImage = Image.extend({
  name: "uploaded-image",
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },
});

export default UpdatedImage;
