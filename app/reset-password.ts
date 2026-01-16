import { createPostgresDatabaseConnection } from "@firecms/backend";
import { hashPassword } from "@firecms/backend/src/auth/password";
import { eq } from "drizzle-orm";
import { users } from "@firecms/backend/src/db/auth-schema";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const email = process.argv[2] || "francesco@firecms.co";
const newPassword = process.argv[3] || "NewPassword123!";

async function resetPassword() {
    const db = createPostgresDatabaseConnection(process.env.DATABASE_URL!);
    const hash = await hashPassword(newPassword);

    const result = await db.update(users)
        .set({ passwordHash: hash })
        .where(eq(users.email, email))
        .returning({
            id: users.id,
            email: users.email
        });

    if (result.length > 0) {
        console.log(`Password reset for: ${result[0].email}`);
        console.log(`New password: ${newPassword}`);
    } else {
        console.log(`User not found: ${email}`);
    }
    process.exit(0);
}

resetPassword().catch(console.error);
