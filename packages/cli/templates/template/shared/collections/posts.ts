import { EntityCollection } from "@rebasepro/types";

const postsCollection: EntityCollection = {
    name: "Posts",
    singularName: "Post",
    slug: "posts",
    table: "posts",
    icon: "Article",
    properties: {
        id: {
            name: "ID",
            type: "number",
            validation: {
                required: true
            }
        },
        title: {
            name: "Title",
            type: "string",
            validation: {
                required: true
            }
        },
        content: {
            name: "Content",
            type: "string",
            multiline: true
        },
        status: {
            name: "Status",
            type: "string",
            enum: [
                {
                    id: "draft",
                    label: "Draft",
                    color: "grayLight"
                },
                {
                    id: "review",
                    label: "In Review",
                    color: "orangeLight"
                },
                {
                    id: "published",
                    label: "Published",
                    color: "greenLight"
                }
            ]
        }
    }
};

export default postsCollection;
