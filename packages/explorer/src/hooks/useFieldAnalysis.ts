import { useMemo } from "react";
import { createFieldAnalyzer } from "../services/fieldAnalyzer";
import { DocumentData, InferredSchema } from "../types";

/**
 * Hook to analyze documents and discover fields
 * Results are memoized to avoid re-computation
 */
export function useFieldAnalysis(documents: DocumentData[]): InferredSchema {
    const fieldAnalyzer = useMemo(() => createFieldAnalyzer(), []);

    const schema = useMemo(() => {
        return fieldAnalyzer.analyzeDocuments(documents);
    }, [documents, fieldAnalyzer]);

    return schema;
}
