import { ChangeEvent, useEffect, useState } from 'react';
import { useSurvey } from '../../context/SurveyContext';
import { Button } from '@firecms/ui';

interface StepProps {
    setStep: (step: number) => void;
    step: number;
}

const Step1 = ({ setStep, step }: StepProps) => {
    const { data, setData } = useSurvey();
    const [selectedValue, setSelectedValue] = useState<string | undefined>(data.foodType);

    useEffect(() => {
        setData({ ...data, foodType: selectedValue  as any});
    }, [selectedValue]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedValue(e.target.value);
    };

    return (
        <div className={"flex flex-col gap-4"}>
            <div className={"typography-h3"}>What type of food do you prefer?</div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="foodType" value="Omnivore" onChange={handleChange} checked={selectedValue === 'Omnivore'} />
                    Omnivore
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="foodType" value="Vegetarian" onChange={handleChange} checked={selectedValue === 'Vegetarian'} />
                    Vegetarian
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="foodType" value="Vegan" onChange={handleChange} checked={selectedValue === 'Vegan'} />
                    Vegan
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="foodType" value="Pescatarian" onChange={handleChange} checked={selectedValue === 'Pescatarian'} />
                    Pescatarian
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="foodType" value="Keto" onChange={handleChange} checked={selectedValue === 'Keto'} />
                    Keto
                </label>
            </div>
            <div>
                <label className={"flex flex-row gap-2"}>
                    <input type="radio" name="foodType" value="Paleo" onChange={handleChange} checked={selectedValue === 'Paleo'} />
                    Paleo
                </label>
            </div>
            <Button variant="filled" color="primary" size="medium" disabled={!selectedValue} onClick={() => setStep(step + 1)}>
                Next
            </Button>
        </div>
    );
};

export default Step1;
