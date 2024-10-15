import svgLoader from "vite-svg-loader"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  extends: [".."],
  app: {
    baseURL: "/dev/",
  },
  runtimeConfig: {
    public: {
      ...process.env,
    },
  },

  modules: [
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          "Noto Sans": [200, 300, 400, 500, 600, 700],
        },
      },
    ],
  ],

  alias: {
    //"~": "./",
    // "@": "./",
    // "@trollUI": "@",
    // "@@": "@"
  },

  css: ["./assets/scss/common-elements.scss"], //this relative isn't going to work when it gets pushed to github
  //css: ["trollUI/assets/scss/resets.scss", "trollUI/assets/scss/common-elements.scss", "./assets/scss/common-elements.scss"],
  vite: {
    // resolve: {
    //   alias: {
    //     "@@": join(currentDir, "./"),
    //     // "trollUI": "@",
    //   },
    // },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          // additionalData: `
          //   @import "@@/assets/scss/design/colors.scss";
          // `,
        },
      },
    },
    plugins: [
      svgLoader({
        svgoConfig: {
          plugins: [
            {
              name: "removeViewBox",
            },
            {
              name: "removeStyleElement",
              active: false,
            },
          ],
        },
      }),
    ],
  },

  compatibilityDate: "2024-10-14",
})
