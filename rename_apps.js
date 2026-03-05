const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        try {
            let isDirectory = fs.statSync(dirPath).isDirectory();
            if (isDirectory) {
                if (f !== 'node_modules' && f !== 'dist' && f !== '.next' && !f.startsWith('.') && f !== 'build' && f !== '.firebase') {
                    walk(dirPath, callback);
                }
            } else {
                if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.md') || f.endsWith('.mdx') || f.endsWith('.txt') || f.endsWith('.json')) {
                    callback(dirPath);
                }
            }
        } catch (e) {}
    });
}

function replaceInFiles() {
    ['app', 'legacy_examples', 'saas', 'saas_datatalk', 'website'].forEach(dir => {
        if (!fs.existsSync(dir)) return;
        walk(dir, file => {
            let content = fs.readFileSync(file, 'utf8');
            let original = content;
            content = content.replace(/\bDataSourceDelegate\b/g, 'DataSource');
            content = content.replace(/\buseFirestoreDelegate\b/g, 'useFirestoreDataSource');
            content = content.replace(/\bFirestoreDelegate\b/g, 'FirestoreDataSource');
            content = content.replace(/\bFetchCollectionDelegateProps\b/g, 'FetchCollectionProps');
            content = content.replace(/\bFetchEntityDelegateProps\b/g, 'FetchEntityProps');
            content = content.replace(/\bListenCollectionDelegateProps\b/g, 'ListenCollectionProps');
            content = content.replace(/\bListenEntityDelegateProps\b/g, 'ListenEntityProps');
            content = content.replace(/\bSaveEntityDelegateProps\b/g, 'SaveEntityProps');
            content = content.replace(/\bMongoDataSourceDelegate\b/g, 'MongoDataSource');
            content = content.replace(/\bPostgresDataSourceDelegate\b/g, 'PostgresDataSource');
            content = content.replace(/dataSourceDelegate\.ts/g, 'postgresDataSource.ts');
            content = content.replace(/MongoDataSourceDelegate\.ts/g, 'MongoDataSource.ts');
            content = content.replace(/\bdataSourceDelegate\b/g, 'dataSource');
            content = content.replace(/useMongoDBDelegate/g, 'useMongoDataSource');

            if (content !== original) {
                fs.writeFileSync(file, content);
                console.log('Updated ' + file);
            }
        });
    });
}
replaceInFiles();
