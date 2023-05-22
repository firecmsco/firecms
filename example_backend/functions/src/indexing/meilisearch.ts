import { MeiliSearch } from 'meilisearch'
import { query } from "express";


const MEILISEARCH_HOST = process?.env?.MEILISEARCH_HOST as string;
const MEILISEARCH_KEY = process?.env?.MEILISEARCH_KEY;

const client = new MeiliSearch({
    host: MEILISEARCH_HOST,
    apiKey: MEILISEARCH_KEY,
})

export async function indexInMeiliSearch(indexName: string, data: any, id: string) {
    const index = client.index(indexName);
    let response = await index.addDocuments([
        {
            id,
            ...data
        }
    ]);

    console.log(response)
}


export async function deleteInMeiliSearch(indexName: string, id: string) {
    const index = client.index(indexName);
    let response = await index.deleteDocument(id);
    console.log(response)
}

export async function searchMeiliSearch(indexName: string, query: string) {
    const index = client.index(indexName);
    let response = await index.search(query);
    console.log(response)
    return response.hits;
}

export async function fetchFromMeiliSearch(indexName: string, filter: string) {
    const index = client.index(indexName);
    let response = await index.search('', { filter: filter })
    console.log(response)
    return response.hits;
}
