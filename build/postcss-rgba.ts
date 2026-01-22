// build/postcss-rgba.ts
import type { PluginCreator } from "postcss"
import { rgbaToColorMix } from "../app/utils/stylers.js"

/**
 * PostCSS plugin to transform custom rgba() syntax into color-mix()
 *
 * Transforms:
 *   rgba(#fff, 50%)          → color-mix(in lab, #fff 50%, transparent)
 *   rgba(var(--color), 50%)  → color-mix(in lab, var(--color) 50%, transparent)
 *   rgba(#f00, 0.5)          → color-mix(in lab, #f00 50%, transparent)
 */
function createColorMixPlugin(): PluginCreator<void> {
  return {
    postcssPlugin: "postcss-rgba-to-color-mix",
    Declaration(decl) {
      // Only process declarations that contain rgba(
      if (!decl.value.includes("rgba(")) {
        return
      }

      // Apply transformation using shared utility
      const transformed = rgbaToColorMix(decl.value)

      // Only update if something changed
      if (transformed !== decl.value) {
        decl.value = transformed
      }
    },
  }
}

createColorMixPlugin.postcss = true

export default createColorMixPlugin
