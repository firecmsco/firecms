import { buildCollection } from "@firecms/core";
import {
    OpenAIInstructionsActions
} from "../collection_actions/OpenAIInstructionsActions";

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
    slug: "books",
    dbPath: "books",
    icon: "MenuBook",
    group: "Content",
    textSearchEnabled: true,
    Actions: OpenAIInstructionsActions,
    description: "Example of a books collection that allows data enhancement through the use of the **OpenAI plugin**",
    // hideFromNavigation: true,
    properties: {
        title: {
            name: "Title",
            validation: { required: true },
            type: "string"
        },
        authors: {
            name: "Authors",
            type: "string"
        },
        description: {
            name: "Description",
            type: "string",
            markdown: true
        },
        spanish_description: {
            name: "Spanish description",
            type: "string",
            markdown: true
        },
        thumbnail: {
            name: "Thumbnail",
            type: "string",
            url: "image"
        },
        category: {
            name: "Category",
            type: "string",
            enumValues: categories
        },
        tags: {
            name: "Tags",
            type: "array",
            of: {
                type: "string"
            }
        },
        published_year: {
            name: "Published Year",
            type: "number",
            validation: { integer: true, min: 0 }
        },
        num_pages: {
            name: "Num pages",
            type: "number"
        },
        created_at: {
            name: "Created at",
            type: "date",
            autoValue: "on_create"
        }
    }
});
