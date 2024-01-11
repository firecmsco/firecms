import { generateIconKeys } from "./generateIconKeys.ts";
import { saveIconFiles } from "./saveIconFiles.ts";

generateIconKeys().then(saveIconFiles);
