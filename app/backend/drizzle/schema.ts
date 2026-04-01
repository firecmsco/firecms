import { pgTable, foreignKey, serial, varchar, integer, numeric, boolean, timestamp, jsonb, uuid, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const postsStatus = pgEnum("posts_status", ['draft', 'review', 'published', 'archived'])
export const projectUsersRole = pgEnum("project_users_role", ['admin', 'editor', 'viewer'])
export const testEntitiesNumberEnum = pgEnum("test_entities_number_enum", ['10', '20'])
export const testEntitiesStringEnum = pgEnum("test_entities_string_enum", ['opt_a', 'opt_b'])


export const posts = pgTable("posts", {
	id: serial().primaryKey().notNull(),
	title: varchar().notNull(),
	content: varchar(),
	authorId: integer("author_id"),
	status: postsStatus(),
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

export const authors = pgTable("authors", {
	id: serial().primaryKey().notNull(),
	name: varchar().notNull(),
	email: varchar().notNull(),
	picture: varchar(),
});

export const testEntities = pgTable("test_entities", {
	id: integer().primaryKey().notNull(),
	stringPlain: varchar("string_plain"),
	stringMultiline: varchar("string_multiline"),
	stringMarkdown: varchar("string_markdown"),
	stringUrl: varchar("string_url"),
	stringEmail: varchar("string_email"),
	stringEnum: testEntitiesStringEnum("string_enum").notNull(),
	numberPlain: numeric("number_plain"),
	numberEnum: numeric("number_enum"),
	booleanPlain: boolean("boolean_plain"),
	datePlain: timestamp("date_plain", { withTimezone: true, mode: 'string' }),
	dateTime: timestamp("date_time", { withTimezone: true, mode: 'string' }),
	mapPlain: jsonb("map_plain"),
	arrayString: jsonb("array_string"),
	arrayEnum: jsonb("array_enum"),
});

export const projectUsers = pgTable("project_users", {
	projectId: varchar("project_id").default(sql`nextval('project_users_project_id_seq'::regclass)`).primaryKey().notNull(),
	id: varchar().notNull(),
	email: varchar().notNull(),
	role: projectUsersRole(),
});

export const privateNotes = pgTable("private_notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar().notNull(),
	content: varchar(),
	userId: varchar("user_id").notNull(),
	isLocked: boolean("is_locked"),
});

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

export const tagsTestEntities = pgTable("tags_test_entities", {
	testEntitieId: integer("test_entitie_id").notNull(),
	testEntityTagId: integer("test_entity_tag_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.testEntitieId],
			foreignColumns: [testEntities.id],
			name: "tags_test_entities_test_entitie_id_test_entities_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.testEntityTagId],
			foreignColumns: [tags.id],
			name: "tags_test_entities_test_entity_tag_id_tags_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.testEntitieId, table.testEntityTagId], name: "tags_test_entities_test_entitie_id_test_entity_tag_id_pk"}),
]);
