/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint in CI/Vercel builds so deploys don’t fail on lint-only issues
  eslint: { ignoreDuringBuilds: true },
  // Keep TS errors enabled (safer). If you hit TS errors later, set to true temporarily.
  typescript: { ignoreBuildErrors: false },
};
export default nextConfig;
