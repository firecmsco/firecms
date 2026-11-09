import test from "node:test";
import assert from "node:assert/strict";

import { FireCMSApiClient } from "../dist/api-client.js";

/**
 * The API client over an in-memory collection store, recording each merge the way
 * BackendFirestoreClient.mergeCollection would apply it (top-level keys replaced).
 */
function clientWith(collection) {
    const api = new FireCMSApiClient({
        session: { email: async () => "admin@example.test", backendIdToken: async () => "token", googleAccessToken: async () => undefined },
        apiUrl: "http://127.0.0.1:1"
    });
    const store = { products: structuredClone(collection) };
    Object.defineProperty(api, "collections", {
        value: {
            getCollection: async (projectId, id) => store[id] ? structuredClone(store[id]) : null,
            mergeCollection: async (projectId, id, data) => {
                store[id] = { ...store[id], ...structuredClone(data) };
                return store[id];
            }
        }
    });
    return { api, store };
}

const products = () => ({
    id: "products",
    path: "products",
    propertiesOrder: ["name", "meta"],
    properties: {
        name: { dataType: "string", name: "Name" },
        meta: {
            dataType: "map",
            name: "Meta",
            propertiesOrder: ["source"],
            properties: {
                source: { dataType: "string", name: "Source" },
                address: { dataType: "map", name: "Address", properties: { city: { dataType: "string" } } }
            }
        }
    }
});

// On 2026-11-10 save_property with namespace "meta" wrote a root key "meta.color",
// which the CMS never shows, instead of adding "color" inside the "meta" map.

test("save_property with a namespace nests the property inside the map", async () => {
    const { api, store } = clientWith(products());
    await api.saveProperty("p", "products", "color", { dataType: "string", name: "Color" }, "meta");

    const saved = store.products;
    assert.equal("meta.color" in saved.properties, false);
    assert.deepEqual(saved.properties.meta.properties.color, { dataType: "string", name: "Color" });
    assert.deepEqual(saved.properties.meta.propertiesOrder, ["source", "color"]);
    // The root order and the map's other properties are left as they were.
    assert.deepEqual(saved.propertiesOrder, ["name", "meta"]);
    assert.deepEqual(saved.properties.meta.properties.source, { dataType: "string", name: "Source" });
});

test("save_property follows a dotted namespace into a map within a map", async () => {
    const { api, store } = clientWith(products());
    await api.saveProperty("p", "products", "zip", { dataType: "string" }, "meta.address");

    assert.deepEqual(Object.keys(store.products.properties.meta.properties.address.properties), ["city", "zip"]);
    assert.equal(store.products.properties.meta.properties.address.propertiesOrder, undefined);
});

test("save_property refuses a namespace that isn't a map", async () => {
    const { api, store } = clientWith(products());
    await assert.rejects(api.saveProperty("p", "products", "x", { dataType: "string" }, "name"), /"name".*string property, not a map/);
    await assert.rejects(api.saveProperty("p", "products", "x", { dataType: "string" }, "missing"), /"missing" does not exist/);
    await assert.rejects(api.saveProperty("p", "products", "x", { dataType: "string" }, "meta.source"), /"meta.source".*not a map/);
    assert.deepEqual(store.products, products());
});

test("save_property without a namespace still adds to the root", async () => {
    const { api, store } = clientWith(products());
    await api.saveProperty("p", "products", "price", { dataType: "number" });

    assert.deepEqual(store.products.properties.price, { dataType: "number" });
    assert.deepEqual(store.products.propertiesOrder, ["name", "meta", "price"]);
});

test("delete_property with a namespace removes it from inside the map", async () => {
    const { api, store } = clientWith(products());
    await api.deleteProperty("p", "products", "source", "meta");

    assert.equal("source" in store.products.properties.meta.properties, false);
    assert.deepEqual(store.products.properties.meta.propertiesOrder, []);
    assert.ok(store.products.properties.meta.properties.address);

    await assert.rejects(api.deleteProperty("p", "products", "source", "meta"), /"meta.source" does not exist/);
    await assert.rejects(api.deleteProperty("p", "products", "x", "name"), /not a map/);
});

test("delete_property cleans up a dotted root key an earlier version wrote", async () => {
    const broken = products();
    broken.properties["meta.color"] = { dataType: "string" };
    broken.propertiesOrder.push("meta.color");
    const { api, store } = clientWith(broken);

    await api.deleteProperty("p", "products", "color", "meta");

    assert.deepEqual(store.products, products());
});
