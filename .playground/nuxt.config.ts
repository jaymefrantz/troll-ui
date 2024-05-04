export default defineNuxtConfig({
  extends: ['..'],
  runtimeConfig: {
    public: {
      ...process.env,
    }
  },
  alias: {
    "~": "./",
  },
  css: ["~/assets/scss/common-elements.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @import "@/assets/scss/global.scss"; 
          `,
        },
      },
    },
  }
})
