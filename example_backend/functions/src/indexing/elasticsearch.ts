import { Client } from "@elastic/elasticsearch";

const client = new Client({
    cloud: { id: process.env.ES_CLOUD_ID as string },
    auth: {
        username: process.env.ES_USER as string,
        password: process.env.ES_PASSWORD as string
    },
})

export function indexInElasticSearch(indexName: string, data: any, id: string) {
    return client.index({
        index: indexName,
        id: id,
        body: data
    })
}

export function deleteInElasticSearch(indexName: string, id: string) {
    return client.delete({
        index: indexName,
        id: id
    })
}

export function searchInElasticSearch(indexName: string, query: any) {
    return client.search({
        index: indexName,
        body: {
            query: {
                "query_string": {
                    "query": query,
                }
            }
        }
    })
}

