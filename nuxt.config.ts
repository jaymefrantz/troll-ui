// import svgLoader from "vite-svg-loader"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import fs from "node:fs"
const CLOUDINARY = `https://res.cloudinary.com/travelingtroll/image/upload/${process.env.CLOUDINARY_FOLDER}`
const currentDir = dirname(fileURLToPath(import.meta.url))
const cwd = process.cwd() + "/app"
import defaultBreakpoints from "./app/assets/ui/js/breakpoints.ts"
import createViewportPlugin from "./build/postcss-viewport.ts"
import createRGBAPlugin from "./build/postcss-rgba.ts"
let breakpoints = defaultBreakpoints.breakpoints
let useModernRanges = defaultBreakpoints.useModernRanges
const configPath = `${cwd === currentDir ? `${cwd}/.playground` : cwd}/assets/js/breakpoints.ts`
let centerMarginWraps = ["medium-small", "medium", "medium-large", "large", "extra-large"]

if (fs.existsSync(configPath)) {
  try {
    const { default: appBreakpoints } = await import(configPath)
    breakpoints = { ...breakpoints, ...appBreakpoints.breakpoints }
    useModernRanges = appBreakpoints?.useModernRanges ?? useModernRanges
    if (appBreakpoints.centerMarginWraps) {
      centerMarginWraps = appBreakpoints.centerMarginWraps
    }
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
          innerHTML: `${centerMarginWraps
            .map(b => `.${b}-center-margin-wrap { --wrap-size: ${breakpoints[b]}}`)
            .join("\n")}:root {${centerMarginWraps.map(b => `--${b}-viewport: ${breakpoints[b]};`).join("\n")}}`,
        },
      ],
    },
  },
  devtools: { enabled: true },
  // alias: { "@": currentDir },
  runtimeConfig: {
    public: {
      breakpoints,
      CLOUDINARY,
    },
  },
  modules: ["@vueuse/nuxt", "@nuxt/icon"],
  css: [
    join(currentDir, "./app/assets/ui/scss/resets.css"),
    join(currentDir, "./app/assets/ui/scss/common-elements.css"),
    join(currentDir, "./app/assets/ui/scss/root.css"),
  ],
  imports: {
    dirs: ["utils"],
  },
  icon: {
    mode: "svg",
  },
  vite: {
    resolve: {
      alias: {
        "@ui": join(currentDir, "./app/assets/ui/"),
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
        plugins: [createViewportPlugin({ breakpoints, useModernRanges }), createRGBAPlugin()],
      },
    },
  },
})
