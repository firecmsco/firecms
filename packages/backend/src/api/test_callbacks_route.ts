import express, { Request, Response } from "express";
import { PostgresDataSource } from "../services/postgresDataSource";
import { callbacksTestCollection } from "./collections_for_test/callbacks_test_collection";

export const createCallbacksTestRouter = (dataSource: PostgresDataSource) => {
    const router = express.Router();

    router.post("/test-crud", async (req: Request, res: Response) => {
        try {
            console.log("\n--- STARTING CALLBACK TEST CRUD ---");
            const collection = callbacksTestCollection;
            const path = "callback_tests";

            // We mock a user for the backend context
            const mockUser: any = {
                uid: "test-user-id",
                email: "test@example.com",
                roles: [{ id: "admin", name: "Admin" }]
            };

            // 1. Create (Save) Entity
            console.log("\n1. Testing saveEntity (Creation)...");
            const delegate = await dataSource.withAuth(mockUser);
            const savedEntity = await delegate.saveEntity({
                path,
                collection,
                status: "new",
                values: { name: "Test Entity" }
            });
            console.log("Returned Saved Entity:", savedEntity);

            // 2. Fetch Entity
            console.log("\n2. Testing fetchEntity...");
            const fetchedEntity = await delegate.fetchEntity({
                path,
                collection,
                entityId: savedEntity.id
            });
            console.log("Returned Fetched Entity:", fetchedEntity);

            // 3. Update (Save) Entity
            console.log("\n3. Testing saveEntity (Update)...");
            const updatedEntity = await delegate.saveEntity({
                path,
                collection,
                status: "existing",
                entityId: savedEntity.id,
                values: { name: "Test Entity Updated" }
            });
            console.log("Returned Updated Entity:", updatedEntity);

            // 4. Fetch Collection
            console.log("\n4. Testing fetchCollection...");
            const fetchedCollection = await delegate.fetchCollection({
                path,
                collection,
                limit: 10
            });
            console.log(`Returned ${fetchedCollection.length} entities in collection.`);

            // 5. Delete Entity
            console.log("\n5. Testing deleteEntity...");
            await delegate.deleteEntity({
                collection,
                entity: updatedEntity
            });
            console.log("Delete operation completed.");

            console.log("\n--- FINISHED CALLBACK TEST CRUD ---\n");

            res.json({ success: true, message: "Check backend console for logs." });
        } catch (error) {
            console.error("Test Route Error:", error);
            res.status(500).json({ error: error });
        }
    });

    return router;
};
