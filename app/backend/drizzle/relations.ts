import { relations } from "drizzle-orm/relations";
import { authors, posts, profiles, postsTags, tags } from "./schema";

export const postsRelations = relations(posts, ({one, many}) => ({
	author: one(authors, {
		fields: [posts.authorId],
		references: [authors.id]
	}),
	postsTags: many(postsTags),
}));

export const authorsRelations = relations(authors, ({many}) => ({
	posts: many(posts),
	profiles: many(profiles),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	author: one(authors, {
		fields: [profiles.authorId],
		references: [authors.id]
	}),
}));

export const postsTagsRelations = relations(postsTags, ({one}) => ({
	post: one(posts, {
		fields: [postsTags.postId],
		references: [posts.id]
	}),
	tag: one(tags, {
		fields: [postsTags.tagId],
		references: [tags.id]
	}),
}));

export const tagsRelations = relations(tags, ({many}) => ({
	postsTags: many(postsTags),
}));