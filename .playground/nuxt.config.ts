import fonts from "./assets/js/fonts.ts"
import svgLoader from "vite-svg-loader"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const currentDir = dirname(fileURLToPath(import.meta.url))
const layer =
  process.env.ENV === "PROD"
    ? [
        "github:jaymefrantz/troll-ui", // GitHub Remote Source
        { install: true },
      ]
    : [".."]

console.log("layer", layer)

export default defineNuxtConfig({
  // extends: [".."],
  extends: layer,
  app: {
    baseURL: "/dev/",
    head: {
      meta: [{ name: "robots", content: "noindex, nofollow" }],
    },
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
        families: fonts,
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
    vue: {
      template: {
        compilerOptions: {
          // isCustomElement: tag => tag === "selectedcontent",
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
