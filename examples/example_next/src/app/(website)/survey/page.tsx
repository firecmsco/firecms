'use client';

import { useState } from 'react';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import Step6 from './components/Step6';
import Results from './components/Results';
import { SurveyProvider } from '../context/SurveyContext';

const steps = [
    Step1,
    Step2,
    Step3,
    Step4,
    Step5,
    Step6,
];

const Survey = () => {
    return (
        <SurveyProvider>
            <SurveyInner/>
        </SurveyProvider>
    );
};

const SurveyInner = () => {
    const [step, setStep] = useState(0);
    const StepComponent = step < steps.length ? steps[step] : undefined;

    return (
        <div className="min-h-[600px] flex flex-col items-center justify-center p-6 bg-white flex-grow">
            <div className="p-4 max-w-lg w-full rounded-lg mb-4">

                {StepComponent ? (<>
                        <StepComponent setStep={setStep} step={step}/>
                    </>
                ) : (
                    <Results/>
                )}
            </div>
        </div>
    );
};

export default Survey;
