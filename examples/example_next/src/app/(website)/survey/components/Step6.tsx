import { useSurvey } from '../../context/SurveyContext';
import { Button } from '@firecms/ui';

interface StepProps {
    setStep: (step: number) => void;
    step: number;
}

const Step6 = ({ setStep, step }: StepProps) => {
    const { data, setData } = useSurvey();

    return (
        <div className={"flex flex-col gap-4"}>
            <p className={"typography-h3"}>What&apos;s your name?</p>
            <div>
                <input
                    type="name"
                    className="border border-gray-400 p-2 rounded w-full"
                    placeholder="Your name"
                    onChange={(e) => {
                        setData({ ...data, name: e.target.value });
                    }}
                />
            </div>
            <p className={"typography-h3"}>What&apos;s your email?</p>
            <div>
                <input
                    type="email"
                    className="border border-gray-400 p-2 rounded w-full"
                    placeholder="Your email"
                    onChange={(e) => {
                        setData({ ...data, email: e.target.value });
                    }}
                />
            </div>
            <Button variant="filled" color="primary" size="medium" disabled={!data.email || !data.name}
                    onClick={() => setStep(step + 1)}>
                Next
            </Button>
        </div>
    );
};

export default Step6;
