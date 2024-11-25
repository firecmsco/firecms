"use client";

import { useSurvey } from '../../context/SurveyContext';
import { useEffect, useRef } from "react";
import { saveSurveyResult } from "@/app/common/api";

const Results = () => {
    const { data } = useSurvey();

    const dataSent = useRef(false);
    useEffect(() => {
        if (dataSent.current) return;
        saveSurveyResult(data);
        dataSent.current = true;
    }, [])

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <div className="p-4 max-w-md w-full rounded-lg mb-4">
                <h2 className="typography-h3 mb-4">Thank you</h2>
                <h3 className="text-lg font-bold mb-4">Our team will get in touch with you soon</h3>
            </div>
        </div>
    );
}

export default Results;
