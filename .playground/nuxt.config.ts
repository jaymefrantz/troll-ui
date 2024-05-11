export default defineNuxtConfig({
  extends: ['..'],
  runtimeConfig: {
    public: {
      ...process.env,
    }
  },
  alias: {
    "~": "./",
    "@": "./",
    "trollUI": "@"
  },
  css: ["~/assets/scss/common-elements.scss"],
  vite: {
    // resolve: {
    //   alias: {
    //     // '@': join(currentDir, './'),
    //     "trollUI": "@",
    //   },
    // },
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
