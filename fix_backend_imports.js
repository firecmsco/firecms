const fs = require('fs');
const files = [
    'packages/backend/src/api/server.ts',
    'packages/backend/src/api/services/index.ts',
    'packages/backend/src/api/test_callbacks_route.ts',
    'packages/backend/src/factory.ts',
    'packages/backend/src/index.ts',
    'packages/backend/src/init.ts',
    'packages/backend/src/websocket.ts'
];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/services\/dataSource/g, 'services/postgresDataSource');
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
});
