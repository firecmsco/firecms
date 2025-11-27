// @ts-ignore
import authorsData from '../content/blog/authors.yml';

export interface AuthorSocials {
    x?: string;
    github?: string;
    linkedin?: string;
}

export interface Author {
    name: string;
    title: string;
    url: string;
    image_url: string;
    email: string;
    socials?: AuthorSocials;
}

export type Authors = Record<string, Author>;

export function getAuthors(): Authors {
    return authorsData as Authors;
}

export function getAuthor(authorKey: string): Author | null {
    const authors = getAuthors();
    return authors[authorKey] || null;
}

