import map from "./assets/js/map.ts"
import colors from "./assets/js/colors.ts"

export default defineAppConfig({
  styles: {
    colors: {
      ...colors,
      primary: colors.purple,
      "site-color": colors["near-white"],
      "site-background": colors["near-black"],
    },
    font: {
      family: "'Noto Sans', sans-serif",
      weight: "300",
      max: "1.2rem",
      min: "1rem",
      scaler: "2.4vw",
    },
  },
  map,
})
