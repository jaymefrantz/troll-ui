/* --------------------------------------------
 * Types
 * ------------------------------------------ */
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export interface JSONObject {
  [key: string]: JSONValue
}
export interface JSONArray extends Array<JSONValue> {}

/* --------------------------------------------
 * rgba(hex|var(), opacity) -> color-mix()
 * ------------------------------------------ */
/**
 * Transform rgba(hex|var, opacity) to color-mix()
 * @example
 * rgbaToColorMix('rgba(#fff, 0.5)') // 'color-mix(in lab, #fff 50%, transparent)'
 * rgbaToColorMix('rgba(var(--color), 50%)') // 'color-mix(in lab, var(--color) 50%, transparent)'
 */
export function rgbaToColorMix(value: string): string {
  const rgbaPattern = /rgba\(\s*((?:#[0-9a-fA-F]{3,8}|var\([^)]+\)))\s*,\s*([0-9.]+%?)\s*\)/g

  return value.replace(rgbaPattern, (match, color, opacity) => {
    let opacityPercent = String(opacity).trim()

    if (!opacityPercent.endsWith("%")) {
      const decimal = parseFloat(opacityPercent)
      if (Number.isNaN(decimal)) return match
      opacityPercent = `${Math.round(decimal * 100)}%`
    }

    return `color-mix(in lab, ${color} ${opacityPercent}, transparent)`
  })
}

/* --------------------------------------------
 * JSON tokens -> CSS custom properties
 * ------------------------------------------ */
/**
 * By default we DO NOT auto-quote strings.
 * The assumption: your token values are already valid CSS values.
 *
 * If you need a literal string in the output CSS, include quotes in the token:
 *   content: '"Hello"'
 *   font: '"Work Sans"'
 *
 * Arrays become scale keys:
 *   index 0 => 50
 *   index 1 => 100
 *   index 2 => 200
 *   ...
 */
export interface JsonToCSSVarsOptions {
  /**
   * Convert arrays to a Tailwind-like scale: 50,100,200...
   * If false, uses numeric index: 0,1,2...
   */
  arrayScaleKeys?: boolean

  /**
   * If true, treat a string that literally starts+ends with backticks as raw
   * and strip the backticks.
   * NOTE: This only applies if your JSON value actually contains backticks,
   * e.g. value: "`black`" (backticks as characters).
   */
  stripBacktickWrapper?: boolean

  /**
   * Optional dev-only warning for suspicious unquoted values (e.g. "Work Sans")
   * that contain spaces but don't look like typical CSS syntax (functions/lists).
   * Does not change output.
   */
  warnOnSuspiciousSpaces?: boolean

  /**
   * Called when warnOnSuspiciousSpaces detects a suspicious value.
   * Defaults to console.warn.
   */
  onWarn?: (message: string) => void
}

const defaultWarn = (msg: string) => {
  // eslint-disable-next-line no-console
  console.warn(msg)
}

const scaleKey = (i: number) => (i === 0 ? "50" : String(i * 100))

function looksLikeCssSyntax(value: string): boolean {
  // If it contains typical CSS punctuation, it's likely intentional raw CSS:
  // - functions: foo(...)
  // - lists: a, b
  // - shorthands: a/b or a b or a-b (hyphens are fine)
  // We only use this for warnings, not output decisions.
  return /[(),/]/.test(value)
}

function isAlreadyQuoted(value: string): boolean {
  const t = value.trim()
  return (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))
}

function formatTokenValue(v: JSONValue, opts: Required<Pick<JsonToCSSVarsOptions, "stripBacktickWrapper">>): string {
  if (v === null) return "null"
  if (typeof v === "string") {
    const t = v.trim()
    if (opts.stripBacktickWrapper && t.startsWith("`") && t.endsWith("`")) {
      return t.slice(1, -1)
    }
    return v
  }
  return String(v)
}

export function jsonToCSSVars(obj: JSONObject, prefix = "", options: JsonToCSSVarsOptions = {}): string[] {
  const out: string[] = []

  const opts = {
    arrayScaleKeys: options.arrayScaleKeys ?? true,
    stripBacktickWrapper: options.stripBacktickWrapper ?? true,
    warnOnSuspiciousSpaces: options.warnOnSuspiciousSpaces ?? false,
    onWarn: options.onWarn ?? defaultWarn,
  }

  const maybeWarn = (cssVarName: string, raw: string) => {
    if (!opts.warnOnSuspiciousSpaces) return

    const t = raw.trim()
    if (!t.includes(" ")) return
    if (looksLikeCssSyntax(t)) return
    if (isAlreadyQuoted(t)) return

    // This is the common footgun: font family with spaces, etc.
    opts.onWarn(
      `[jsonToCSSVars] Value contains spaces and is not quoted. ` +
        `If this is meant to be a string literal, wrap it in quotes in your token value. ` +
        `Example: '"Work Sans"'.\n` +
        `  ${cssVarName}: ${raw}`
    )
  }

  const walk = (curr: JSONValue, path: string): void => {
    if (Array.isArray(curr)) {
      curr.forEach((val, i) => {
        const key = opts.arrayScaleKeys ? scaleKey(i) : String(i)
        const fullName = `--${path}-${key}`
        const formatted = formatTokenValue(val, opts)
        if (typeof val === "string") maybeWarn(fullName, formatted)
        out.push(`${fullName}: ${formatted};`)
      })
      return
    }

    if (curr && typeof curr === "object") {
      for (const [k, v] of Object.entries(curr)) {
        walk(v, path ? `${path}-${k}` : k)
      }
      return
    }

    const fullName = `--${path}`
    const formatted = formatTokenValue(curr, opts)
    if (typeof curr === "string") maybeWarn(fullName, formatted)
    out.push(`${fullName}: ${formatted};`)
  }

  walk(obj, prefix)
  return out
}

/* --------------------------------------------
 * SVG string -> CSS url(data:image/svg+xml...)
 * ------------------------------------------ */
/**
 * Converts an SVG string into a CSS-safe data URL.
 * Useful for background-image tokens.
 */
export function svgToCssUrl(svgString: string): string {
  // Remove line breaks and tabs
  let cleaned = svgString.replace(/[\n\r\t]+/g, " ")

  // Remove extra spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ")

  // Escape special characters
  cleaned = cleaned
    .replace(/"/g, "'") // avoid conflict with outer double quotes
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/{/g, "%7B")
    .replace(/}/g, "%7D")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\?/g, "%3F")
    .replace(/&/g, "%26")

  return `url("data:image/svg+xml;utf8,${cleaned}")`
}
