import { removeUndefined } from "./packages/common/src/util/objects";
import * as fs from "fs";
fs.writeFileSync("/tmp/out4.txt", JSON.stringify(removeUndefined({ securityRules: [] })));
