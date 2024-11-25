import { ChangeEvent, useEffect, useState } from 'react';
import { useSurvey } from '../../context/SurveyContext';
import { Button } from '@firecms/ui';

interface StepProps {
    setStep: (step: number) => void;
    step: number;
}

const Step4 = ({ setStep, step }: StepProps) => {
    const { data, setData } = useSurvey();
    const [selectedValues, setSelectedValues] = useState<string[]>(data.nutritionalRequirement || []);

    useEffect(() => {
        setData({ ...data, nutritionalRequirement: selectedValues as any});
    }, [selectedValues]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedValues(values =>
            values.includes(value) ? values.filter(v => v !== value) : [...values, value]
        );
    };

    return (
        <div className={"flex flex-col gap-4"}>
            <p className={"typography-h3"}>What are your nutritional requirements?</p>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input
                        type="checkbox"
                        name="nutritionalRequirement"
                        value="Low carb"
                        onChange={handleChange}
                        checked={selectedValues.includes('Low carb')}
                    />
                    Low carb
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input
                        type="checkbox"
                        name="nutritionalRequirement"
                        value="Low fat"
                        onChange={handleChange}
                        checked={selectedValues.includes('Low fat')}
                    />
                    Low fat
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input
                        type="checkbox"
                        name="nutritionalRequirement"
                        value="High protein"
                        onChange={handleChange}
                        checked={selectedValues.includes('High protein')}
                    />
                    High protein
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input
                        type="checkbox"
                        name="nutritionalRequirement"
                        value="Gluten-free"
                        onChange={handleChange}
                        checked={selectedValues.includes('Gluten-free')}
                    />
                    Gluten-free
                </label>
            </div>
            <Button variant="filled" color="primary" size="medium" disabled={selectedValues.length === 0}
                    onClick={() => setStep(step + 1)}>
                Next
            </Button>
        </div>
    );
};

export default Step4;
