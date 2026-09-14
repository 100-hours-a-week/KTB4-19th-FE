import react from "@vitejs/plugin-react";
import { seedDesignPlugin } from "@seed-design/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), seedDesignPlugin({ colorMode: "light-only" })],
  resolve: {
    tsconfigPaths: true,
  },
});
