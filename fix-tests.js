const fs = require('fs');

const testFiles = fs.readdirSync('packages/postgresql-backend/test/')
  .filter(f => f.endsWith('.ts'))
  .map(f => 'packages/postgresql-backend/test/' + f);

testFiles.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/\.\.\/src\/db\/entityService/g, '../src/services/entityService');
  c = c.replace(/\.\.\/src\/services\/postgresDataDriver/g, '../src/PostgresBackendDriver');
  c = c.replace(/PostgresDataDriver/g, 'PostgresBackendDriver');
  c = c.replace(/\.\.\/src\/generate-drizzle-schema-logic/g, '../src/schema/generate-drizzle-schema-logic');
  c = c.replace(/\.\.\/src\/collections\/BackendCollectionRegistry/g, '../src/collections/PostgresCollectionRegistry');
  c = c.replace(/\.\.\/src\/db\/auth-schema/g, '../src/schema/auth-schema');
  c = c.replace(/BackendCollectionRegistry/g, 'PostgresCollectionRegistry');
  fs.writeFileSync(file, c);
});
console.log("Fixed tests!");
