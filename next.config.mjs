const nextConfig = {
    reactStrictMode: true,
    env: {
      MONGODB_URI: process.env.MONGODB_URI, // Ensure the env variable is passed
    },
  };
  
  export default nextConfig;  // ✅ Use ES Modules export
  