import { buildCollection } from "@firecms/core";

const categories = {
    fiction: "Fiction",
    drama: "Drama",
    "fantasy-fiction": "Fantasy fiction",
    history: "History",
    religion: "Religion",
    "self-help": "Self-Help",
    "comics-graphic-novels": "Comics & Graphic Novels",
    "juvenile-fiction": "Juvenile Fiction",
    philosophy: "Philosophy",
    fantasy: "Fantasy",
    education: "Education",
    science: "Science",
    medical: "Medical",
    cooking: "Cooking",
    travel: "Travel"
};

export const booksCollection = buildCollection({
    name: "Books",
    singularName: "Book",
    id: "books",
    path: "books",
    icon: "MenuBook",
    group: "Content",
    textSearchEnabled: true,
    description: "Example of a books collection that allows data enhancement through the use of the **OpenAI plugin**",
    properties: {
        title: {
            name: "Title",
            validation: { required: true },
            dataType: "string"
        }
    }
});
