import { buildEntityPropertiesFromData } from "../collection_builder";

// import usage from "./usage.json" assert {
//         type: "json",
//         integrity: "sha384-ABC123"
//         };
import usage from "./pop_products.json" assert {
        type: "json",
        integrity: "sha384-ABC123"
        };
import * as util from "util";
import { DataType } from "../cms_types";

buildEntityPropertiesFromData(usage, getType)
    .then((res) => console.log(util.inspect(res, { showHidden: false, depth: null, colors: true })));


function getType(value: any): DataType {
    if (typeof value === "number")
        return "number";
    else if (typeof value === "string")
        return "string";
    else if (typeof value === "boolean")
        return "boolean";
    else if (Array.isArray(value))
        return "array";
    else if (value && "_seconds" in value && "_nanoseconds" in value)
        return "date";
    else if (value && "id" in value && "path" in value)
        return "reference";
    return "map";
}
