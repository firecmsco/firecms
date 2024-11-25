import { ChangeEvent, useEffect, useState } from 'react';
import { useSurvey } from '../../context/SurveyContext';
import { Button } from '@firecms/ui';

interface StepProps {
    setStep: (step: number) => void;
    step: number;
}

const Step5 = ({ setStep, step }: StepProps) => {
    const { data, setData } = useSurvey();
    const [selectedValue, setSelectedValue] = useState<string | undefined>(data.goal);

    useEffect(() => {
        setData({ ...data, goal: selectedValue as any });
    }, [selectedValue]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedValue(e.target.value);
    };

    return (
        <div className={"flex flex-col gap-4"}>
            <p className={"typography-h3"}>Tell us more details</p>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="goal" value="Weight loss" onChange={handleChange}
                           checked={selectedValue === 'Weight loss'}/>
                    Weight loss
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="goal" value="Muscle gain" onChange={handleChange}
                           checked={selectedValue === 'Muscle gain'}/>
                    Muscle gain
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="goal" value="Maintain weight" onChange={handleChange}
                           checked={selectedValue === 'Maintain weight'}/>
                    Maintain weight
                </label>
            </div>
            <Button variant="filled" color="primary" size="medium" disabled={!selectedValue}
                    onClick={() => setStep(step + 1)}>
                Next
            </Button>
        </div>
    );
};

export default Step5;
