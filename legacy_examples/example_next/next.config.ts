import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: "/",
                destination: "/products",
                permanent: false
            }
        ]
    }
};

export default nextConfig;
