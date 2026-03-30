import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo-gymmate192.png", "logo-gymmate512.png"],
      manifest: {
        name: "GymMate | Your Fitness Buddy",
        short_name: "GymMate",
        description: "ระบบจัดการฟิตเนสอัจฉริยะสำหรับมหาวิทยาลัย",
        theme_color: "#84cc16",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "logo-gymmate192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "logo-gymmate512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      devOptions: {
        enabled: true, // ทำให้ทดสอบ PWA ในโหมด dev ได้
      },
    }),
  ],
  server: {
    port: Number(process.env.VITE_PORT) || 4000,
  },
});
