import type { NextConfig } from 'next';

const prodPath = process.env['TRANS_VOICE_PATH'] || '';
const isProd = process.env.NODE_ENV === 'production';

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
    basePath: isProd ? prodPath : '',
    assetPrefix: isProd ? prodPath + "/" : '',

    images: {
        unoptimized: true,
    },
};

export default nextConfig;