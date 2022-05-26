import React, { useState } from "react"

export const Newsletter = () => {
    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [submitClicked, setSubmitClicked] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [policyAccepted, setPolicyAccepted] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Submitting", email);
        setSubmitClicked(true);
        if (!validEmail) return;
        setLoading(true);
        fetch("https://europe-west3-firecms-demo-27150.cloudfunctions.net/api/sign_up_newsletter", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email_address": email,
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

    console.log("validEmail", validEmail);
    return (
        <section
            className="relative">
            <div
                className={"max-w-4xl mx-auto px-4 sm:px-6 mb-16"}
                data-aos="fade-up"
                data-aos-delay="100">
                <div
                    className="relative flex flex-col items-center px-6 py-12 bg-white dark:bg-gray-900 rounded border-solid dark:border-gray-800 border-gray-200">
                    <h2 className="h2 mb-8">
                        Stay in the loop
                    </h2>

                    <p>
                        We are working on a FireCMS <strong>cloud
                        offering</strong> that will include a state of the art
                        collection editor.
                    </p>
                    <p> Sign up to be able to try it as soon
                        as it launches in beta!
                    </p>

                    <div className="flex flex-wrap">

                        <form onSubmit={handleSubmit}>
                            <div
                                className="w-full py-2 border-b-2 border-gray-400 flex justify-between gap-2">
                                <input
                                    disabled={loading || completed}
                                    className={"appearance-none outline-none text-xl flex-1 px-4 py-4 bg-gray-200 dark:bg-gray-700 rounded w-full text-gray-700 dark:text-gray-200 leading-tight focus:border-blue-600 "
                                        + (!validEmail && submitClicked ? "border-solid border-red-600" : "border-none")}
                                    id="email" type="email"
                                    placeholder="Enter your email"
                                    onChange={handleEmailChange}
                                    value={email}/>
                                <button type="submit"
                                        disabled={loading || completed || !policyAccepted}
                                        className={"btn px-8 py-4 sm:px-12 sm:py-4 text-white font-bold uppercase w-full w-auto sm:mb-0 sm:ml-2 " + (loading || !policyAccepted ? "bg-gray-200 dark:bg-gray-700" : (completed ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"))}>
                                    {loading ? "Loading" : (completed ? "Signed up!" : "Sign up")}
                                </button>
                            </div>
                            <label
                                className="w-full flex items-baseline gap-3 text-gray-600 dark:text-gray-200 text-sm">
                                <input type="checkbox" value="policy-read"
                                       checked={policyAccepted}
                                       onChange={() => setPolicyAccepted(!policyAccepted)}/>
                                <span>By subscribing to our newsletter, you acknowledge you have read, and agree to <a
                                    href="/privacy_policy"
                                    className="underline">our personal data policy</a>.</span>
                            </label>
                        </form>
                        {error && <p className={"text-red-400"}>There was an
                            error. Make sure you introduced a valid email!</p>}
                    </div>

                </div>
            </div>

        </section>
    )
}

function validateEmail(email: string) {
    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
}
