import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native / Node-only Pakete nicht in den Server-Bundle ziehen.
  serverExternalPackages: ["mysql2", "@node-rs/argon2"],
  experimental: {
    // Aktiviert forbidden()/unauthorized() + app/forbidden.tsx fuer RBAC.
    authInterrupts: true,
  },
};

export default nextConfig;
