import { EntityCollection } from "@firecms/types";
import tagsCollection from "./tags";

const testEntitiesCollection: EntityCollection = {
    name: "Test Entities",
    singularName: "Test Entity",
    slug: "test_entities",
    dbPath: "test_entities",
    icon: "BugReport",
    properties: {
        id: {
            name: "ID",
            type: "number",
            isId: true
        },

        // --- String Types ---
        string_plain: {
            name: "Plain Text String",
            type: "string",
            defaultValue: "Default string",
            validation: {
                min: 2,
                max: 100
            }
        },
        string_multiline: {
            name: "Multiline String",
            type: "string",
            multiline: true
        },
        string_markdown: {
            name: "Markdown String",
            type: "string",
            markdown: true
        },
        string_url: {
            name: "URL String",
            type: "string",
            url: true
        },
        string_email: {
            name: "Email String",
            type: "string",
            email: true
        },
        string_enum: {
            name: "Enum String",
            type: "string",
            enum: [
                { id: "opt_a", label: "Option A", color: "blueLight" },
                { id: "opt_b", label: "Option B", color: "redLight" }
            ],
            validation: {
                required: true
            }
        },

        // --- Number Types ---
        number_plain: {
            name: "Plain Number",
            type: "number",
            validation: {
                min: 0,
                max: 100
            }
        },
        number_enum: {
            name: "Enum Number",
            type: "number",
            enum: [
                { id: 10, label: "Ten" },
                { id: 20, label: "Twenty" }
            ]
        },

        // --- Boolean Types ---
        boolean_plain: {
            name: "Plain Boolean",
            type: "boolean"
        },

        // --- Date Types ---
        date_plain: {
            name: "Date Default",
            type: "date"
        },
        date_time: {
            name: "Date with Time",
            type: "date",
            mode: "date_time"
        },

        // --- Complex Types ---
        map_plain: {
            name: "Map Fields",
            type: "map",
            properties: {
                nested_string: {
                    name: "Nested String",
                    type: "string"
                },
                nested_number: {
                    name: "Nested Number",
                    type: "number"
                }
            }
        },

        // --- Arrays ---
        array_string: {
            name: "Array of Strings",
            type: "array",
            of: {
                name: "String",
                type: "string"
            }
        },
        array_enum: {
            name: "Array of Enums",
            type: "array",
            of: {
                name: "Enum",
                type: "string",
                enum: [
                    { id: "cat", label: "Cat" },
                    { id: "dog", label: "Dog" },
                    { id: "bird", label: "Bird" }
                ]
            }
        },

        // --- References / Relations ---
        reference_tags: {
            name: "Reference to Tags",
            type: "reference",
            path: "tags"
        },
        relation_tags: {
            name: "Relation to Tags",
            type: "relation",
            relationName: "test_entity_tags"
        }
    },
    relations: [
        {
            relationName: "test_entity_tags",
            target: () => tagsCollection,
            cardinality: "many",
            direction: "owning"
        }
    ]
};

export default testEntitiesCollection;
