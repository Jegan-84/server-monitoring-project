/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["aalamsoft.com"],
  },
  compilerOptions: {
    typeRoots: ["./types", "./node_modules/@types"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias["html2pdf.js"] = false;
    }
    return config;
  },
};

module.exports = nextConfig;
