// Example: How to enable APIs in your app
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { createPostgresDatabaseConnection, initializeFireCMSBackend } from "@firecms/backend";
import { collections } from "shared";
import { tables, enums, relations } from "./schema.generated";

const app = express();
const server = createServer(app);
const db = createPostgresDatabaseConnection(process.env.DATABASE_URL!);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize FireCMS Backend with API endpoints
initializeFireCMSBackend({
    collections,
    tables,
    enums,
    relations,
    db,
    server,
    api: {
        app, // Pass your Express app
        basePath: '/api',
        enableGraphQL: true,
        enableREST: true,
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:5173'],
            credentials: true
        },
        auth: {
            enabled: true,
            validator: async (req) => {
                // Your auth logic
                const token = req.headers.authorization?.replace('Bearer ', '');
                return token ? { userId: '1', role: 'user' } : false;
            }
        }
    }
});

// Your existing routes...
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

server.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
    console.log('📊 GraphQL: http://localhost:3000/api/graphql');
    console.log('📚 REST API: http://localhost:3000/api/');
    console.log('📖 Docs: http://localhost:3000/api/swagger');
});
