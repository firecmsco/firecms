import { describe, expect, test } from "@jest/globals";
import type { Entity } from "@firecms/core";
import { fetchSelectedEntities } from "../src/export/selected_entities";

const entity = (id: string, values: Record<string, any> = {}, path = "products"): Entity<any> => ({ id, path, values });

const collection = { id: "products", path: "products", name: "Products", properties: {} } as any;

/** A data source holding the current state of each entity, keyed by `path/id`. */
function dataSourceWith(current: Entity<any>[]) {
    const calls: Record<string, any>[] = [];
    return {
        calls,
        dataSource: {
            fetchEntity: async (props: any) => {
                calls.push(props);
                return current.find((e) => e.path === props.path && e.id === props.entityId);
            }
        } as any
    };
}

describe("fetchSelectedEntities", () => {

    test("returns the selection in table order, not in the order it was ticked", async () => {
        const { dataSource } = dataSourceWith([entity("a"), entity("b"), entity("c")]);

        const result = await fetchSelectedEntities({
            dataSource,
            selectedEntities: [entity("c"), entity("a")],
            tableData: [entity("a"), entity("b"), entity("c")],
            collection,
            path: "products"
        });

        expect(result.map((e) => e.id)).toEqual(["a", "c"]);
    });

    test("puts entities the table has not loaded last, in the order they were selected", async () => {
        const { dataSource } = dataSourceWith([entity("a"), entity("x"), entity("y")]);

        const result = await fetchSelectedEntities({
            dataSource,
            selectedEntities: [entity("y"), entity("a"), entity("x")],
            tableData: [entity("a")],
            collection,
            path: "products"
        });

        expect(result.map((e) => e.id)).toEqual(["a", "y", "x"]);
    });

    test("exports the current values, not the ones from when the entity was selected", async () => {
        const { dataSource } = dataSourceWith([entity("a", { price: 12 })]);

        const result = await fetchSelectedEntities({
            dataSource,
            selectedEntities: [entity("a", { price: 10 })],
            collection,
            path: "products"
        });

        expect(result[0].values).toEqual({ price: 12 });
    });

    test("leaves out entities deleted since they were selected", async () => {
        const { dataSource } = dataSourceWith([entity("a")]);

        const result = await fetchSelectedEntities({
            dataSource,
            selectedEntities: [entity("a"), entity("gone")],
            collection,
            path: "products"
        });

        expect(result.map((e) => e.id)).toEqual(["a"]);
    });

    test("passes the path segments only for entities at the exported path", async () => {
        const pathSegments = ["nodes", "node/42", "edges"];
        const here = entity("a", {}, "nodes/node/42/edges");
        const elsewhere = entity("b", {}, "nodes/other/edges");
        const { dataSource, calls } = dataSourceWith([here, elsewhere]);

        await fetchSelectedEntities({
            dataSource,
            selectedEntities: [here, elsewhere],
            collection,
            path: "nodes/node/42/edges",
            pathSegments
        });

        expect(calls.find((c) => c.entityId === "a")).toMatchObject({ path: "nodes/node/42/edges", pathSegments });
        expect(calls.find((c) => c.entityId === "b")).toMatchObject({ path: "nodes/other/edges", pathSegments: undefined });
    });
});
