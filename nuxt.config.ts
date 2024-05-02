import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const CLOUDINARY = `https://res.cloudinary.com/travelingtroll/image/upload/${process.env.ENV === "dev" ? "dev" : "prod"}`


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
      CLOUDINARY
    }
  },
  modules: [
    "@vueuse/nuxt",
  ],
  css: [
    join(currentDir, './assets/scss/resets.scss'),
    join(currentDir, './assets/scss/common-elements.scss')
  ],
  imports: {
    dirs: ['utils']
  },
  vite: {
    // resolve: {
    //   alias: {
    //     '@': join(currentDir, './'),
    //     '~': join(currentDir, './'),
    //   },
    // },
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

