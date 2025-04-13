import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    output: "export",
    experimental: {
        turbo: {
            // turbopack
        },
    },

    /**
     * Set base path. This is the slug of your GitHub repository.
     *
     * @see https://nextjs.org/docs/app/api-reference/next-config-js/basePath
     */
    basePath: process.env.NODE_ENV === 'production' ? '/trans-voice-trainer' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/trans-voice-trainer/' : '',

    images: {
        unoptimized: true,
    },
};

console.log(nextConfig.basePath);

export default nextConfig;