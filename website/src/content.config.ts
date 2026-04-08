import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection } from "astro:content";

const docs = defineCollection({
	loader: docsLoader(),
	schema: docsSchema()
});

export const collections = {
	docs,
};
