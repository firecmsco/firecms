import React from 'react';

export function BrowserFrame({ children }: { children: React.ReactNode }) {
    return <div
        data-aos="fade-up"
        className="rounded-lg mx-auto w-fit flex flex-col content-center justify-center border border-solid dark:border-gray-800 border-gray-200">
        <div
            className="h-11 rounded-t-lg bg-gray-900 flex justify-start items-center space-x-1.5 px-3">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
        </div>

        {children}

    </div>;
}
