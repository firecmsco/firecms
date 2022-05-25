import React, { useState } from "react"

export const NewsletterWidget = () => {
    const [email, setEmail] = useState("");
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {

        console.log("Submitting", email);
        setLoading(true)
        fetch("https://us5.api.mailchimp.com/3.0/lists/d356ca5a84/members", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Authorization': 'Basic YW55c3RyaW5nOjYzNTcwN2U5ZWQzZDRiODAzNWY0MjhjMWY5M2ViYjBiLXVzNQ=='
            },
            body: JSON.stringify({
                "email_address": email,
                "status": "subscribed"
            })
        }).then(res => {
            setCompleted(true)
        }).finally(() => setLoading(false));
    }

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target
        setEmail(value)
    }

    return (
        <section
            className="relative">
            <div
                className={"max-w-4xl mx-auto px-4 sm:px-6 mb-16"}
                data-aos="fade-up"
                data-aos-delay="100">
                <div
                    className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded shadow-2xl">
                    <h2 className="h2 mb-4">
                        Newsletter
                    </h2>

                    <div className="flex flex-wrap">

                        <div
                            className="w-full py-2 border-b-2 border-gray-400 flex justify-between gap-2">
                            <input
                                disabled={loading}
                                className="appearance-none outline-none border-none text-xl flex-1 px-4 py-4 bg-gray-200 dark:bg-gray-700 rounded w-full text-gray-700 dark:text-gray-200 leading-tight focus:border-blue-600"
                                id="email" type="email"
                                placeholder="Enter your email"
                                onChange={handleEmailChange} value={email}/>
                            <button type="submit"
                                    onClick={handleSubmit}
                                    disabled={loading || completed}
                                    className={"btn px-8 py-4 sm:px-12 sm:py-4 text-white font-bold uppercase bg-blue-600 hover:text-white hover:bg-blue-700 w-full w-auto sm:mb-0 sm:ml-2" +( completed ? "bg-green-600" : "")}>
                                {completed ? "Signed up!" : "Sign up"}
                            </button>

                        </div>
                        <label
                            className="w-full flex items-baseline gap-3 text-gray-600 dark:text-gray-200">
                            <input type="checkbox" value="policy-read"/>
                            <span>By subscribing to our newsletter, you acknowledge you have read, understood and agree to abide by <a
                                href="#" className="underline">our personal data policy</a>.</span>
                        </label>
                    </div>

                </div>
            </div>

        </section>
    )
}
