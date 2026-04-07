import { db } from './app/backend/src/db/db.js';
async function test() {
   const posts = await db.query.posts.findMany({
      with: {
          tags: {
             with: { tag_id: true }
          }
      }
   });
   console.log(JSON.stringify(posts, null, 2));
}
test().catch(console.error).then(() => process.exit(0));
