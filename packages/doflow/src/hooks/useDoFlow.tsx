import { useState } from "react";
import { DoFlowConfig } from "../types";

export const useDoFlow = (): DoFlowConfig => {

    const [sampleParameter, setSampleParameter] = useState<string>("");
    return {
        sampleParameter
    };
};
