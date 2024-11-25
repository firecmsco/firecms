import { ChangeEvent, useEffect, useState } from 'react';
import { useSurvey } from '../../context/SurveyContext';
import { Button } from '@firecms/ui';

interface StepProps {
    setStep: (step: number) => void;
    step: number;
}

const Step3 = ({ setStep, step }: StepProps) => {
    const { data, setData } = useSurvey();
    const [selectedValue, setSelectedValue] = useState<string | undefined>(data.dietAspect);

    useEffect(() => {
        setData({ ...data, dietAspect: selectedValue as any });
    }, [selectedValue]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedValue(e.target.value);
    };

    return (
        <div className={"flex flex-col gap-4"}>
            <p className={"typography-h3"}>What&apos;s most important to you in a diet?</p>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="dietAspect" value="Taste" onChange={handleChange}
                           checked={selectedValue === 'Taste'}/>
                    Taste
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="dietAspect" value="Convenience" onChange={handleChange}
                           checked={selectedValue === 'Convenience'}/>
                    Convenience
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="dietAspect" value="Healthiness" onChange={handleChange}
                           checked={selectedValue === 'Healthiness'}/>
                    Healthiness
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="dietAspect" value="Variety" onChange={handleChange}
                           checked={selectedValue === 'Variety'}/>
                    Variety
                </label>
            </div>
            <Button variant="filled" color="primary" size="medium" disabled={!selectedValue}
                    onClick={() => setStep(step + 1)}>
                Next
            </Button>
        </div>
    );
};

export default Step3;
