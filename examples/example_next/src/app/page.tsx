import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="p-4 max-w-md w-full bg-white shadow-md rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Welcome to the Food App</h2>
                <p className="mb-4">You&apos;re in good hands. Let&apos;s find you the best meals tailored for you!</p>
                <Link href="/survey">
                    <button className={""}>
                        Get Started
                    </button>
                </Link>
            </div>
        </div>
    );
}
