import react from "@vitejs/plugin-react";
import { seedDesignPlugin } from "@seed-design/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), seedDesignPlugin({ colorMode: "light-only" })],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    allowedHosts: true,
    // refresh 쿠키(SameSite=Strict, Path=/api/v1/auth)를 같은 origin으로 주고받기 위해 API를 프록시한다.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:8080",
        changeOrigin: false,
      },
    },
  },
});
