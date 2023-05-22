import Typesense from "typesense";

const client = new Typesense.Client({
    'nodes': [{
        'host': process.env.TYPESENSE_HOST as string, // For Typesense Cloud use xxx.a1.typesense.net
        'port': 443,      // For Typesense Cloud use 443
        'protocol': 'https'   // For Typesense Cloud use https
    }],
    'apiKey': process.env.TYPESENSE_API_KEY as string,
    'connectionTimeoutSeconds': 2
})

export function createSchemaInTypesense(indexName: string) {
    return client.collections().create({
        "name": indexName,
        "fields": [
            { "name": ".*", "type": "auto" }
        ]
    })
}

export async function indexInTypesense(indexName: string, data: any, id: string) {
    const response = await client.collections(indexName).documents().upsert({
        id,
        ...data
    })
    console.log(response)

}

export function searchInTypesense(indexName: string, query: string) {
    return client.collections(indexName).documents().search({
        q: query,
        query_by: "*" // doesn't work, need to specify fields
    });
}


