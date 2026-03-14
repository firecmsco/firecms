import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { removeInitialAndTrailingSlashes } from "@rebasepro/common";

export function RebaseRouter({
    children,
    basePath
}: {
    children: any,
    basePath?: string;
}) {
    return <RouterProvider router={createBrowserRouter([
        {
            path: basePath ? `${removeInitialAndTrailingSlashes(basePath)}/*` : "/*",
            element: children
        }
    ])} />;
}
