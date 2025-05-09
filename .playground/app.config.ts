import map from "./assets/js/map.ts"
import colors from "./assets/js/colors.ts"
import icons from "./assets/js/icons.ts"
import fonts from "./assets/js/fonts.ts"

export default defineAppConfig({
  colors,
  fonts,
  root: {
    font: {
      min: "1.1rem",
      max: "1.5rem",
      scaler: "2.375vw",
    },
    "line-height": {
      sm: "1.15",
      md: "1.2",
      lg: "1.4",
    },
    heading: {
      font: "Nunito",
      weight: "800",
      size: {
        xxl: "2.67em",
        xl: "2.325em",
        lg: "2em",
        md: "1.65em",
        sm: "1.35em",
        xs: "1em",
        xxs: "0.75em",
      },
    },
    body: {
      font: "Work Sans",
      weight: "300",
      size: {
        lg: "1.125em",
        md: "1em",
        sm: "0.875em",
        xs: "0.75em",
        xxs: "0.65em",
      },
    },
  },
  font: {
    family: "'Noto Sans', sans-serif",
    weight: "300",
    max: "1.2rem",
    min: "1rem",
    scaler: "2.4vw",
  },
  icons,
  map,
})
