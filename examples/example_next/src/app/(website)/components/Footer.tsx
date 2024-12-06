export function Footer() {

    return <footer className="bg-white dark:bg-surface-900">
        <div className="mx-auto w-full max-w-screen-xl">
            <div className="grid grid-cols-2 gap-8 px-4 py-6 lg:py-8 md:grid-cols-4">
                <div>
                    <h2 className="mb-6 text-sm font-semibold text-surface-900 uppercase dark:text-white">Company</h2>
                    <ul className="text-surface-500 dark:text-surface-400 font-medium">
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">About</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Careers</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Brand Center</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Blog</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h2 className="mb-6 text-sm font-semibold text-surface-900 uppercase dark:text-white">Help
                        center</h2>
                    <ul className="text-surface-500 dark:text-surface-400 font-medium">
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Discord Server</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Twitter</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Facebook</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Contact Us</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h2 className="mb-6 text-sm font-semibold text-surface-900 uppercase dark:text-white">Legal</h2>
                    <ul className="text-surface-500 dark:text-surface-400 font-medium">
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Privacy Policy</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Licensing</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Terms &amp; Conditions</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h2 className="mb-6 text-sm font-semibold text-surface-900 uppercase dark:text-white">Download</h2>
                    <ul className="text-surface-500 dark:text-surface-400 font-medium">
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">iOS</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Android</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">Windows</a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="text-inherit hover:underline">MacOS</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div className={"flex flex-col gap-2 p-3 text-center"}>
            <a className={"font-headers text-text-disabled text-sm font-medium uppercase"}
               href={"https://firecms.co"}>Built with <b>FireCMS</b> </a>
        </div>
    </footer>;

}
