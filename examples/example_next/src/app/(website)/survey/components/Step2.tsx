import { ChangeEvent, useEffect, useState } from 'react';
import { useSurvey } from '../../context/SurveyContext';
import { Button } from '@firecms/ui';

interface StepProps {
    setStep: (step: number) => void;
    step: number;
}

const Step2 = ({ setStep, step }: StepProps) => {
    const { data, setData } = useSurvey();
    const [selectedValue, setSelectedValue] = useState<string | undefined>(data.mealPattern);

    useEffect(() => {
        setData({ ...data, mealPattern: selectedValue  as any});
    }, [selectedValue]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedValue(e.target.value);
    };

    return (
        <div className={"flex flex-col gap-4"}>
            <p className={"typography-h3"}>What’s your meal pattern?</p>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="mealPattern" value="Three meals" onChange={handleChange}
                           checked={selectedValue === 'Three meals'}/>
                    Three meals
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="mealPattern" value="Two meals" onChange={handleChange}
                           checked={selectedValue === 'Two meals'}/>
                    Two meals
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="mealPattern" value="One meal" onChange={handleChange}
                           checked={selectedValue === 'One meal'}/>
                    One meal
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="mealPattern" value="Snacks" onChange={handleChange}
                           checked={selectedValue === 'Snacks'}/>
                    Snacks
                </label>
            </div>
            <Button variant="filled" color="primary" size="medium" disabled={!selectedValue}
                    onClick={() => setStep(step + 1)}>
                Next
            </Button>
        </div>
    );
};

export default Step2;
