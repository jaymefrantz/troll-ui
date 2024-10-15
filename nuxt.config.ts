import { fileURLToPath } from "url"
import { dirname, join } from "path"
const CLOUDINARY = `https://res.cloudinary.com/travelingtroll/image/upload/${
  process.env.ENV === "dev" ? "dev" : "prod"
}`

const currentDir = dirname(fileURLToPath(import.meta.url))

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
    public: {
      CLOUDINARY,
    },
  },
  modules: ["@vueuse/nuxt", "nuxt-icon"],
  css: [
    join(currentDir, "./assets/ui/scss/resets.scss"),
    join(currentDir, "./assets/ui/scss/common-elements.scss"),
  ],
  imports: {
    dirs: ["utils"],
  },
  vite: {
    resolve: {
      alias: {
        "@": join(currentDir, "./"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `
            @import "@/assets/ui/scss/global.scss";
          `,
        },
      },
    },
  },
})
