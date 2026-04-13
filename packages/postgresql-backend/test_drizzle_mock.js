const { sql } = require('drizzle-orm');
const q = sql`ARRAY[${sql.join(['a', 'b'].map(f => sql`${f}`), sql`, `)}]::text[]`;
console.log(JSON.stringify(q, null, 2));
