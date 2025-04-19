type JSONValue = string | number | boolean | null | JSONObject | JSONArray
interface JSONObject {
  [key: string]: JSONValue
}
interface JSONArray extends Array<JSONValue> {}

export function jsonToCSSVars(obj: JSONObject, prefix = ""): string[] {
  const result: string[] = []

  const needsQuotes = (val: JSONValue): boolean => {
    if (typeof val !== "string") return false

    const trimmed = val.trim()

    // Patterns that should not be quoted
    const cssFunctions = /^(var|linear-gradient|calc|url)\(/
    const cssUnits = /[\d.]+(px|rem|em|vw|vh|%)$/
    const hexColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    const isKeyword = /^(inherit|initial|unset|auto|none)$/

    return !(
      cssFunctions.test(trimmed) ||
      cssUnits.test(trimmed) ||
      hexColor.test(trimmed) ||
      isKeyword.test(trimmed) ||
      /^[\d.]+$/.test(trimmed)
    )
  }

  const walk = (curr: JSONValue, path: string): void => {
    if (Array.isArray(curr)) {
      curr.forEach((val, index) => {
        const name = index === 0 ? "50" : `${index * 100}`
        const fullName = `${path}-${name}`
        const wrappedVal = needsQuotes(val) ? `"${val}"` : val
        result.push(`--${fullName}: ${wrappedVal};`)
      })
    } else if (typeof curr === "object" && curr !== null) {
      Object.entries(curr).forEach(([key, val]) => {
        const newPath = path ? `${path}-${key}` : key
        walk(val, newPath)
      })
    } else {
      const wrappedVal = needsQuotes(curr) ? `"${curr}"` : curr
      result.push(`--${path}: ${wrappedVal};`)
    }
  }

  walk(obj, prefix)
  return result
}
