// import svgLoader from "vite-svg-loader"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
const CLOUDINARY = `https://res.cloudinary.com/travelingtroll/image/upload/${process.env.CLOUDINARY_FOLDER}`
const currentDir = dirname(fileURLToPath(import.meta.url))
const cwd = process.cwd()
import defaultBreakpoints from "./assets/ui/js/breakpoints.ts"
import createViewportPlugin from "./build/postcss-viewport.ts"
let breakpoints = defaultBreakpoints.breakpoints
let useModernRanges = defaultBreakpoints.useModernRanges
const configPath = `${cwd === currentDir ? `${cwd}/.playground` : cwd}/assets/js/breakpoints.ts`
import fs from "node:fs"
if (fs.existsSync(configPath)) {
  try {
    const { default: appBreakpoints } = await import(configPath)
    breakpoints = { ...breakpoints, ...appBreakpoints.breakpoints }
    useModernRanges = appBreakpoints?.useModernRanges ?? useModernRanges
  } catch (e) {
    console.log("breakpoint config file failed to load", configPath, e)
  }
}

/*
  TODO:
    bring over mixins, resets and maybe common-elements?
    composables/useObjectSort.ts
    what to do about breakpoints.module.scss
    utils/wait.ts
    need gmap api key
    components:
      Map.vue
      Marker.vue
      Dropdown.vue
      Autocomplete
*/

export default defineNuxtConfig({
  app: {
    head: {
      style: [
        {
          innerHTML: ["medium-small", "medium", "medium-large", "large", "extra-large"]
            .map(b => `.${b}-center-margin-wrap { --wrap-size: ${breakpoints[b]}}`)
            .join("\n"),
        },
      ],
    },
  },
  devtools: { enabled: true },
  alias: { "@": currentDir },
  runtimeConfig: {
    public: {
      breakpoints,
      CLOUDINARY,
    },
  },
  modules: ["@vueuse/nuxt", "nuxt-icon"],
  css: [
    join(currentDir, "./assets/ui/scss/resets.css"),
    join(currentDir, "./assets/ui/scss/common-elements.css"),
    join(currentDir, "./assets/ui/scss/root.css"),
  ],
  imports: {
    dirs: ["utils"],
  },
  vite: {
    resolve: {
      alias: {
        "@ui": join(currentDir, "./"),
      },
    },
    // plugins: [
    //   svgLoader({
    //     svgoConfig: {
    //       plugins: [
    //         {
    //           name: "removeViewBox",
    //         },
    //         {
    //           name: "removeStyleElement",
    //           active: false,
    //         },
    //       ],
    //     },
    //   }),
    // ],
    css: {
      postcss: {
        plugins: [createViewportPlugin({ breakpoints, useModernRanges })],
      },
    },
  },
})
