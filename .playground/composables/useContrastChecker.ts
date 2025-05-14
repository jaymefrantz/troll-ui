export function useContrastChecker(colors: string[], compare: Ref<string>) {
  if (compare.value === undefined) return []
  const failingColors = computed(() => {
    const compareHsl = hexToHsl(compare.value)

    return colors.filter(color => {
      const colorHsl = hexToHsl(color)

      // Calculate the difference in lightness
      const lightnessDifference = Math.abs(compareHsl.l - colorHsl.l)

      // Example threshold for acceptable contrast (adjust as needed)
      const contrastThreshold = 50

      // Return true if the color fails the contrast check
      return lightnessDifference < contrastThreshold
    })
  })

  return failingColors
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, "")

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / delta + 2
        break
      case b:
        h = (r - g) / delta + 4
        break
    }

    h /= 6
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  }
}
