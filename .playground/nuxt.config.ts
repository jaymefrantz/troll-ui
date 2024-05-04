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
            @import "@/assets/scss/mixins.scss"; 
            @import "@/assets/scss/viewports.scss"; 
          `,
        },
      },
    },
  }
})
