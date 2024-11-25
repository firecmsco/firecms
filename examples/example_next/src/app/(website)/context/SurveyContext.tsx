import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SurveyData } from "@/app/common/types";


type SurveyContextType = {
    data: SurveyData;
    setData: (data: SurveyData) => void;
};

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<SurveyData>({});

    return (
        <SurveyContext.Provider value={{ data, setData }}>
            {children}
        </SurveyContext.Provider>
    );
};

export const useSurvey = (): SurveyContextType => {
    const context = useContext(SurveyContext);
    if (!context) {
        throw new Error('useSurvey must be used within a SurveyProvider');
    }
    return context;
};
