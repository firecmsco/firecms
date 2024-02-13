const fs = require("fs");
const path = require("path");

function readFilesRecursively(folderPath, outputFile, allowedExtensions, excludeFolder) {
    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(folderPath, file.name);

            // Check if the current file is the exclude folder
            if (file.isDirectory() && file.name === excludeFolder) {
                return; // Skip the excluded folder
            }

            if (file.isDirectory()) {
                readFilesRecursively(filePath, outputFile, allowedExtensions, excludeFolder);
            } else {
                const fileExtension = path.extname(file.name).toLowerCase();
                if (allowedExtensions.includes(fileExtension)) {
                    fs.readFile(filePath, "utf8", (err, content) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        if (!filePath.endsWith("index.d.ts"))
                            fs.appendFileSync(outputFile, content);
                        console.log(`Content of '${filePath}' written to '${outputFile}'`);
                    });
                }
            }
        });
    });
}

// Usage: node script.js <folderPath> <outputFilePath> <ext1> <ext2> <excludeFolder>
const folderPath = process.argv[2];
const outputFilePath = process.argv[3];
const allowedExtensions = process.argv.slice(4, -1);
const excludeFolder = process.argv.slice(-1)[0];

readFilesRecursively(folderPath, outputFilePath, allowedExtensions, excludeFolder);
