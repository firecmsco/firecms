import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { removeInitialAndTrailingSlashes } from "../util";

export function FireCMSRouter({
                           children,
                           basePath
                       }: {
    children: React.ReactNode,
    basePath?: string;
}) {
    return <RouterProvider router={createBrowserRouter([
        {
            path: basePath ? `${removeInitialAndTrailingSlashes(basePath)}/*` : "/*",
            element: children
        }
    ])}/>;
}
