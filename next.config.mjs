/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  images: { unoptimized: true },
  // path alias @/ já vem do tsconfig
};
export default nextConfig;
