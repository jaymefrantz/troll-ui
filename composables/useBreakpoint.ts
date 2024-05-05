import cssBreakpoints from "~/assets/scss/exports/breakpoints.module.scss"
import { useBreakpoints as vueUseBreakpoints } from "@vueuse/core"

export const useBreakpoints = () => {
  const breakpoints = vueUseBreakpoints(Object.entries(cssBreakpoints).reduce((sizes, [value, size]) => {
    const formattedSize = size.endsWith("px") ? parseInt(size.replace("px", "")) : parseInt(size.replace("rem", "")) * 16
    return { ...sizes, [value]: formattedSize }
  }, {}))

  return breakpoints
}