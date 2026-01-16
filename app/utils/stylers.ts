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
    // If the value uses backtick convention (`...`) consider it raw CSS
    if (trimmed.startsWith("`") && trimmed.endsWith("`")) return false

    // Patterns that should not be quoted anywhere in the string
    const cssFunctionAnywhere = /\b(var|linear-gradient|calc|url|hsl|rgb|rgba|hsla)\(/i
    const cssUnitAnywhere = /[\d.]+(px|rem|em|vw|vh|%|ch|vmin|vmax|s|ms)\b/i
    const hexColor = /#[0-9A-Fa-f]{3,6}\b/
    const isKeyword = /^(inherit|initial|unset|auto|none)$/i

    // If it already contains a single quote assume it's intended as a string
    if (trimmed.includes("'")) return false

    // If it contains CSS functions or units anywhere, don't quote it
    if (cssFunctionAnywhere.test(trimmed) || cssUnitAnywhere.test(trimmed) || hexColor.test(trimmed)) {
      return false
    }

    // Also allow common keywords and plain numbers without quotes
    if (isKeyword.test(trimmed) || /^[\d.]+$/.test(trimmed)) return false

    // Otherwise, quote
    return true
  }

  const walk = (curr: JSONValue, path: string): void => {
    if (Array.isArray(curr)) {
      curr.forEach((val, index) => {
        const name = index === 0 ? "50" : `${index * 100}`
        const fullName = `${path}-${name}`
        let out: string | number | boolean | null = val
        if (typeof val === "string") {
          const t = val.trim()
          if (t.startsWith("`") && t.endsWith("`")) {
            out = t.slice(1, -1)
          } else if (needsQuotes(val)) {
            out = `"${val}"`
          }
        }
        result.push(`--${fullName}: ${out};`)
      })
    } else if (typeof curr === "object" && curr !== null) {
      Object.entries(curr).forEach(([key, val]) => {
        const newPath = path ? `${path}-${key}` : key
        walk(val, newPath)
      })
    } else {
      let out: string | number | boolean | null = curr
      if (typeof curr === "string") {
        const t = curr.trim()
        if (t.startsWith("`") && t.endsWith("`")) {
          out = t.slice(1, -1)
        } else if (needsQuotes(curr)) {
          out = `"${curr}"`
        }
      }
      result.push(`--${path}: ${out};`)
    }
  }

  walk(obj, prefix)
  return result
}

export function svgToCssUrl(svgString: string): string {
  // Remove line breaks and tabs
  let cleaned = svgString.replace(/[\n\r\t]+/g, " ")

  // Remove extra spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ")

  // Escape special characters
  cleaned = cleaned
    .replace(/"/g, `'`) // Replace " with ' to not conflict with outer double quotes
    .replace(/%/g, "%25") // Encode %
    .replace(/#/g, "%23") // Encode #
    .replace(/{/g, "%7B") // Encode {
    .replace(/}/g, "%7D") // Encode }
    .replace(/</g, "%3C") // Encode <
    .replace(/>/g, "%3E") // Encode >
    .replace(/\?/g, "%3F") // Encode ?
    .replace(/&/g, "%26") // Encode &

  return `url("data:image/svg+xml;utf8,${cleaned}")`
}
