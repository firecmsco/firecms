---
title: "Recipe: Blog CMS"
sidebar_label: Blog CMS
slug: docs/recipes/blog-cms
description: Build a complete blog CMS with articles, authors, categories, rich text editing, and image uploads.
---

## Overview

Build a blog backend with:
- **Articles** with markdown content and cover images
- **Authors** with profiles
- **Categories** with a many-to-many relation

## Collections

### Authors

```typescript
import { EntityCollection } from "@rebasepro/types";

export const authorsCollection: EntityCollection = {
    slug: "authors",
    name: "Authors",
    singularName: "Author",
    dbPath: "authors",
    icon: "person",
    properties: {
        name: {
            type: "string",
            name: "Name",
            validation: { required: true }
        },
        email: {
            type: "string",
            name: "Email",
            email: true,
            validation: { required: true, unique: true }
        },
        avatar: {
            type: "string",
            name: "Avatar",
            storage: {
                storagePath: "avatars",
                acceptedFiles: ["image/*"],
                maxSize: 2 * 1024 * 1024
            }
        },
        bio: {
            type: "string",
            name: "Bio",
            multiline: true
        }
    }
};
```

### Categories

```typescript
export const categoriesCollection: EntityCollection = {
    slug: "categories",
    name: "Categories",
    singularName: "Category",
    dbPath: "categories",
    icon: "label",
    properties: {
        name: {
            type: "string",
            name: "Name",
            validation: { required: true }
        },
        slug: {
            type: "string",
            name: "Slug",
            validation: { required: true, unique: true }
        },
        color: {
            type: "string",
            name: "Color",
            enum: [
                { id: "blue", label: "Blue", color: "blueDark" },
                { id: "green", label: "Green", color: "greenDark" },
                { id: "red", label: "Red", color: "pinkDark" },
                { id: "orange", label: "Orange", color: "orangeDark" }
            ]
        }
    }
};
```

### Articles

```typescript
export const articlesCollection: EntityCollection = {
    slug: "articles",
    name: "Articles",
    singularName: "Article",
    dbPath: "articles",
    icon: "article",
    defaultViewMode: "table",
    history: true,
    properties: {
        title: {
            type: "string",
            name: "Title",
            validation: { required: true }
        },
        slug: {
            type: "string",
            name: "URL Slug",
            validation: { required: true, unique: true }
        },
        author: {
            type: "relation",
            name: "Author",
            relationName: "author"
        },
        status: {
            type: "string",
            name: "Status",
            enum: [
                { id: "draft", label: "Draft", color: "grayDark" },
                { id: "review", label: "In Review", color: "orangeDark" },
                { id: "published", label: "Published", color: "greenDark" }
            ],
            defaultValue: "draft"
        },
        cover_image: {
            type: "string",
            name: "Cover Image",
            storage: {
                storagePath: "articles/covers",
                acceptedFiles: ["image/*"]
            }
        },
        content: {
            type: "string",
            name: "Content",
            markdown: true
        },
        excerpt: {
            type: "string",
            name: "Excerpt",
            multiline: true,
            validation: { max: 300 }
        },
        published_at: {
            type: "date",
            name: "Published At"
        },
        created_at: {
            type: "date",
            name: "Created At",
            autoValue: "on_create",
            readOnly: true
        }
    },
    relations: [
        {
            relationName: "author",
            target: () => authorsCollection,
            cardinality: "one",
            localKey: "author_id"
        },
        {
            relationName: "categories",
            target: () => categoriesCollection,
            cardinality: "many",
            through: {
                table: "article_categories",
                sourceColumn: "article_id",
                targetColumn: "category_id"
            }
        }
    ],
    callbacks: {
        beforeSave: async ({ values, status }) => {
            // Auto-generate slug
            if (values.title && !values.slug) {
                values.slug = values.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-");
            }
            // Set published_at when publishing
            if (values.status === "published" && !values.published_at) {
                values.published_at = new Date();
            }
            return values;
        }
    },
    securityRules: [
        { operation: "select", access: "public", using: "{status} = 'published'" },
        { operation: "select", ownerField: "author_id" },
        { operations: ["insert", "update"], ownerField: "author_id" },
        { operation: "delete", roles: ["admin"] }
    ]
};
```

## Setup

1. Add all three collections to your `shared/collections/index.ts`
2. Run `rebase schema generate`
3. Run `rebase db push`
4. Restart the dev server

You now have a fully functional blog CMS with:
- Author management with avatar uploads
- Category tagging via many-to-many relations
- Markdown content editing
- Draft → Review → Published workflow
- Auto-generated URL slugs
- RLS policies limiting authors to their own posts
- Full audit trail via entity history
