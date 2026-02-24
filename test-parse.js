const { URLSearchParams } = require('url');

function decodeString(val) {
    let parsedFilterVal = val;
    if (typeof parsedFilterVal === "string") {
        try {
            parsedFilterVal = JSON.parse(parsedFilterVal);
        } catch (e) {}
    }
    if (typeof parsedFilterVal === "string" && parsedFilterVal.startsWith("ref::")) {
        // mock ref parse
        const [path, id] = parsedFilterVal.substring(5).split("/");
        return true;
    }
    return parsedFilterVal;
}

function parseFilterAndSort(search) {
    const entries = new URLSearchParams(search);
    const filterValues = {};
    let sortBy = undefined;
    entries.forEach((value, key) => {
        if (key === "__sort") {
            sortBy = [decodeURIComponent(value), entries.get("__sort_order")];
        } else if (key.endsWith("_op")) {
            const field = key.replace("_op", "");
            const filterOp = decodeURIComponent(value);
            const filterValStr = entries.get(`${field}_value`);
            if (filterValStr !== null) {
                filterValues[field] = [filterOp, decodeString(filterValStr)];
            }
        }
    });

    return {
        filterValues: Object.keys(filterValues).length ? filterValues : undefined,
        sortBy
    }
}

console.log(JSON.stringify(parseFilterAndSort("?__sort=dataInserimento&__sort_order=asc&fase_op=%3D%3D&fase_value=1&piattaforma_op=%3D%3D&piattaforma_value=ref%3A%3Acompanies%2F2eIpUB533M0pqSe3mS6C"), null, 2));

