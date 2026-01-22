import { pgTable, serial, varchar, foreignKey, integer, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const authors = pgTable("authors", {
	id: serial().primaryKey().notNull(),
	name: varchar().notNull(),
	email: varchar().notNull(),
});

export const posts = pgTable("posts", {
	id: serial().primaryKey().notNull(),
	title: varchar().notNull(),
	content: varchar(),
	authorId: integer("author_id"),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [authors.id],
			name: "posts_author_id_authors_id_fk"
		}).onDelete("set null"),
]);

export const tags = pgTable("tags", {
	id: serial().primaryKey().notNull(),
	name: varchar().notNull(),
});

export const profiles = pgTable("profiles", {
	id: serial().primaryKey().notNull(),
	bio: varchar(),
	website: varchar(),
	authorId: integer("author_id"),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [authors.id],
			name: "profiles_author_id_authors_id_fk"
		}).onDelete("set null"),
]);

export const postsTags = pgTable("posts_tags", {
	postId: integer("post_id").notNull(),
	tagId: integer("tag_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "posts_tags_post_id_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: "posts_tags_tag_id_tags_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.postId, table.tagId], name: "posts_tags_post_id_tag_id_pk"}),
]);
