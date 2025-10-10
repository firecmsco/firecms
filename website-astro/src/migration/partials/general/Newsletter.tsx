import React, { useState } from "react"

export const Newsletter = () => {
    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [submitClicked, setSubmitClicked] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [policyAccepted, setPolicyAccepted] = useState(false);

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        console.log("Submitting", email);
        setSubmitClicked(true);
        if (!validEmail) return;
        setLoading(true);
        fetch("https://api-kdoe6pj3qq-ey.a.run.app" + "/notifications/newsletter", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "email_address": email,
                "source": "landing"
            })
        }).then((res) => {
            console.log("res", res);
            if (res.status < 300) {
                setCompleted(true);
                setError(false);
            } else {
                setError(true);
            }
        }).finally(() => setLoading(false));
    }

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target
        setEmail(value);
        setValidEmail(validateEmail(value));
    }

    return (
        <Panel color={"gray"} className="relative" includePadding={false}>
            <div
                className={"mx-auto px-4 sm:px-6"}
                // data-aos="fade-up"
                // data-aos-delay="100"
            >
                <div
                    className="relative flex flex-col items-center px-6 py-20">

                    {/*<h4 className="mb-4 text-text-primary">*/}
                    {/*    Stay in the loop*/}
                    {/*</h4>*/}
                    <div>
                        <div
                            className="flex flex-col space-y-2 mb-4 text-lg">
                            <strong> Sign up to our newsletter to get the latest
                                news
                                and updates. No spam!
                            </strong>
                        </div>

                        <div className="flex flex-wrap">

                            <form onSubmit={handleSubmit}>

                                <label
                                    className="w-full flex items-baseline gap-3 text-sm">
                                    <input type="checkbox" value="policy-read"
                                           checked={policyAccepted}
                                           onChange={() => setPolicyAccepted(!policyAccepted)}/>
                                    <span>By subscribing to our newsletter, you acknowledge you have read, and agree to <a
                                        href="/policy/privacy_policy"
                                        className="underline ">our personal data policy</a>.</span>
                                </label>
                                <div
                                    className="w-full py-2 flex flex-col md:flex-row justify-between gap-2">
                                    <input
                                        disabled={loading || completed}
                                        className={"appearance-none outline-none text-xl flex-1 px-4 py-4 bg-gray-900 rounded w-full leading-tight focus:border-primary "
                                            + (!validEmail && submitClicked ? "border-solid border-red-600" : "border-none")}
                                        id="email" type="email"
                                        placeholder="Enter your email"
                                        onChange={handleEmailChange}
                                        value={email}/>
                                    <button type="submit"
                                            disabled={loading || completed || !policyAccepted}
                                            className={"typography-button px-8 py-4 sm:px-12 sm:py-4 uppercase w-auto sm:mb-0 sm:ml-2 " + (loading || !policyAccepted ? "bg-gray-800" : (completed ? "bg-green-600" : "bg-primary hover:bg-blue-700"))}>
                                        {loading ? "Loading" : (completed ? "Signed up!" : "Sign up")}
                                    </button>
                                </div>
                            </form>
                            {error && <p className={"text-red-400"}>There was an
                                error. Make sure you introduced a valid
                                email!</p>}
                        </div>

                    </div>
                </div>
            </div>
        </Panel>
    )
}

function validateEmail(email: string) {
    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
}
