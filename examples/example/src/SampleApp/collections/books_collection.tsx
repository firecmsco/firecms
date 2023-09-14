import { buildCollection } from "firecms";
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
    path: "books",
    icon: "MenuBook",
    group: "Main",
    textSearchEnabled: true,
    Actions: OpenAIInstructionsActions,
    description: "Example of a books collection that allows data enhancement through the use of the **OpenAI plugin**",
    // hideFromNavigation: true,
    properties: {
        title: {
            name: "Title",
            validation: { required: true },
            dataType: "string"
        },
        authors: {
            name: "Authors",
            dataType: "string"
        },
        description: {
            name: "Description",
            dataType: "string",
            multiline: true
        },
        spanish_description: {
            name: "Spanish description",
            dataType: "string",
            multiline: true
        },
        thumbnail: {
            name: "Thumbnail",
            dataType: "string",
            url: "image"
        },
        category: {
            name: "Category",
            dataType: "string",
            enumValues: categories
        },
        tags: {
            name: "Tags",
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        published_year: {
            name: "Published Year",
            dataType: "number",
            validation: { integer: true, min: 0 }
        },
        num_pages: {
            name: "Num pages",
            dataType: "number"
        },
        created_at: {
            name: "Created at",
            dataType: "date",
            autoValue: "on_create"
        }
    }
});
