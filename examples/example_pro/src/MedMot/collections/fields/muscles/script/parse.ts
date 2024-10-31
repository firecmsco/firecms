// @ts-ignore
const fs = require("fs");
const csv = require("csv-parser");

const results:any[] = [];

fs.createReadStream("./data.csv")
    .pipe(csv({ separator: ";" }))
    .on("data", (data:any[]) => results.push(data))
    .on("end", () => {
        // console.log(results);

        const muscles = results.map(entry => ({
            id: parseInt(entry.id),
            name: entry.name,
            code: entry.code,
            children: []
        }));

        const musclesMap = new Map();
        muscles.forEach((entry) => musclesMap.set(entry.id, entry));

        const resultsMap = new Map();
        results.forEach((entry) => resultsMap.set(parseInt(entry.id), entry));

        muscles.forEach((muscle) => {
            const res = resultsMap.get(muscle.id);
            if(res.supergroup_id) {
                // console.log(res);
                const parentMuscle = musclesMap.get(parseInt(res.supergroup_id));
                // console.log(parentMuscle);
                parentMuscle.children.push(muscle);
            }
        });

        const result = JSON.stringify(musclesMap.get(3), null, 2);
        fs.writeFile('muscles.ts', result, function (err:any) {
            if (err) return console.log(err);
        });

    });