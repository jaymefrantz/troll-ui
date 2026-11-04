type ProdLayer = [string, { install: boolean }]
type DevLayer = [string]

import fonts from "./app/assets/js/fonts.js"
import iconSets from "./app/assets/js/icons.js"
import svgLoader from "vite-svg-loader"

const layer: ProdLayer | DevLayer =
  process.env.ENV === "PROD"
    ? [
        "github:jaymefrantz/troll-ui", // GitHub Remote Source
        { install: true },
      ]
    : [".."]

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

  icon: {
    serverBundle: {
      collections: [...new Set([
        ...Object.values(iconSets).flatMap(({ icons }) => Object.values(icons).map(name => name.split(":")[0])),
        "heroicons-outline",
        "material-symbols-light",
        "fluent-emoji-high-contrast",
      ])],
    },
  },

  alias: {
    //"~": "./",
    // "@": "./",
    // "@trollUI": "@",
    // "@@": "@"
  },

  vite: {
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
  devtools: {
    enabled: false,
  },
  compatibilityDate: "2024-10-14",
})
