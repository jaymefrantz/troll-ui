// import svgLoader from "vite-svg-loader"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
const CLOUDINARY = `https://res.cloudinary.com/travelingtroll/image/upload/${process.env.CLOUDINARY_FOLDER}`
const cwd = process.cwd()
const currentDir = dirname(fileURLToPath(import.meta.url))
import defaultBreakpoints from "./assets/ui/js/breakpoints.ts"
let breakpoints = defaultBreakpoints
const configPath = `${cwd === currentDir ? `${cwd}/.playground` : cwd}/assets/js/breakpoints.ts`
// console.log("defaultBreakpoints", defaultBreakpoints)

try {
  const appBreakpoints = await import(configPath)
  breakpoints = { ...defaultBreakpoints, ...appBreakpoints.default }
} catch (e) {
  // console.log("no app config found at", configPath, e)
}
// console.log(generateScssVariables(breakpoints))

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
  devtools: { enabled: true },
  alias: { "@": currentDir },
  runtimeConfig: {
    breakpoints,
    public: {
      CLOUDINARY,
    },
  },
  modules: ["@vueuse/nuxt", "nuxt-icon"],
  css: [join(currentDir, "./assets/ui/scss/resets.css"), join(currentDir, "./assets/ui/scss/common-elements.scss")],
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
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `
            @use "sass:math";
            @use "@ui/assets/ui/scss/mixins.scss" as *;
            @use "@ui/assets/ui/scss/viewports.scss" as *;
            @use "@ui/assets/ui/scss/design/colors.scss" as *;
            @use "@ui/assets/ui/scss/design/animations.scss" as *;
          `,
        },
      },
    },
  },
})

function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

// Generate SCSS variables
function generateScssVariables(json: Record<string, string>): string {
  return Object.entries(json)
    .map(([key, value]) => `$${camelToKebab(key)}-viewport: ${value};`)
    .join("\n")
}
