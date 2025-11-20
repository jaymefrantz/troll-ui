// build/postcss-viewport.ts
import type { PluginCreator, AtRule } from "postcss"

type Breakpoints = Record<string, string>

interface ViewportPluginOptions {
  breakpoints: Breakpoints
  /**
   * Amount to subtract from upper bound in legacy mode for "down" / "to"
   * e.g. 60rem -> 59.99rem when epsilon = 0.01
   */
  epsilon?: number
  /**
   * If true, use modern range syntax:
   *   (width >= 40rem) and (width < 60rem)
   * If false, use classic min/max:
   *   (min-width: 40rem) and (max-width: 59.99rem)
   */
  useModernRanges?: boolean
}

function createViewportPlugin(options: ViewportPluginOptions): PluginCreator<void> {
  const { breakpoints, epsilon = 0.01, useModernRanges = false } = options

  // Normalize "medium-viewport" -> "medium"
  function normalizeToken(token: string): string {
    return token.replace(/-viewport$/, "").trim()
  }

  // Parse "12rem" -> { value: 12, unit: "rem" }
  function parseLength(value: string): { value: number; unit: string } | null {
    const m = value.trim().match(/^(-?\d*\.?\d+)([a-z%]+)$/i)
    if (!m) return null
    return { value: parseFloat(m[1]), unit: m[2] }
  }

  /**
   * Resolve:
   *   - "medium-viewport"
   *   - "medium-viewport + 2rem"
   *   - "medium-viewport - 2rem"
   * to a concrete CSS length string.
   * Anything else is returned unchanged.
   */
  function resolveValue(rawToken: string): string {
    const trimmed = rawToken.trim()

    // Pattern: "<name>-viewport +/- <number><unit>"
    const exprMatch = trimmed.match(/^([A-Za-z_][\w-]*-viewport)\s*([+-])\s*(-?\d*\.?\d+[a-z%]+)$/i)

    if (exprMatch) {
      const baseTokenWithSuffix = exprMatch[1] // e.g. "medium-small-viewport"
      const op = exprMatch[2] as "+" | "-"
      const offsetStr = exprMatch[3] // e.g. "2rem"

      const baseName = normalizeToken(baseTokenWithSuffix) // "medium-small"
      const baseVal = breakpoints[baseName]

      if (baseVal) {
        const baseLen = parseLength(baseVal)
        const offsetLen = parseLength(offsetStr)

        if (baseLen && offsetLen && baseLen.unit === offsetLen.unit) {
          const result = op === "+" ? baseLen.value + offsetLen.value : baseLen.value - offsetLen.value

          return `${result}${baseLen.unit}`
        }
      }
      // if anything fails, fall through to normal handling
    }

    // Fallback: plain "<name>-viewport" or literal CSS length
    const token = normalizeToken(trimmed)
    if (breakpoints[token]) return breakpoints[token]
    return rawToken
  }

  // For legacy max-width: subtract epsilon from numeric part
  function subtractEpsilon(value: string): string {
    const len = parseLength(value)
    if (!len) return value
    return `${len.value - epsilon}${len.unit}`
  }

  // For legacy strict greater-than: add epsilon
  function addEpsilon(value: string): string {
    const len = parseLength(value)
    if (!len) return value
    return `${len.value + epsilon}${len.unit}`
  }

  // Build a single clause from something like:
  // "medium-viewport up"
  // "large-viewport down"
  // "small-viewport to medium-viewport"
  // "medium-viewport + 2rem up"
  // "width > medium-small-viewport"
  // "inline-size <= medium-viewport + 2rem"
  function buildClause(clause: string): string {
    const trimmed = clause.trim()

    // 1) Comparison operators: width / inline-size with > >= < <=
    const compMatch = trimmed.match(/^(width|inline-size)\s*(>=|<=|>|<)\s*(.+)$/)
    if (compMatch) {
      const prop = compMatch[1] as "width" | "inline-size"
      const op = compMatch[2] as ">=" | "<=" | ">" | "<"
      const rhsExpr = compMatch[3]

      const val = resolveValue(rhsExpr) // supports foo-viewport +/- offset

      if (useModernRanges) {
        // Keep operator, just resolve RHS
        return `(${prop} ${op} ${val})`
      } else {
        // Legacy: turn into min-/max- feature
        const dim = prop === "inline-size" ? "inline-size" : "width"

        switch (op) {
          case ">":
            // strictly greater → min-dim: val + epsilon
            return `(min-${dim}: ${addEpsilon(val)})`
          case ">=":
            return `(min-${dim}: ${val})`
          case "<":
            // strictly less → max-dim: val - epsilon
            return `(max-${dim}: ${subtractEpsilon(val)})`
          case "<=":
            return `(max-${dim}: ${val})`
        }
      }
    }

    // 2) up / down / to syntax
    const tokens = trimmed.split(/\s+/)
    const hasTo = tokens.includes("to")
    const hasUp = tokens.includes("up")
    const hasDown = tokens.includes("down")

    // Range: "<from> to <to>"
    if (hasTo) {
      const toIndex = tokens.indexOf("to")
      const fromToken = tokens.slice(0, toIndex).join(" ")
      const toToken = tokens.slice(toIndex + 1).join(" ")

      const fromVal = resolveValue(fromToken)
      const toVal = resolveValue(toToken)

      if (useModernRanges) {
        // modern: (width >= from) and (width < to)
        return `(width >= ${fromVal}) and (width < ${toVal})`
      } else {
        // legacy: (min-width: from) and (max-width: to-epsilon)
        const toValMinus = subtractEpsilon(toVal)
        return `(min-width: ${fromVal}) and (max-width: ${toValMinus})`
      }
    }

    // "<name> up"
    if (hasUp) {
      const upIndex = tokens.indexOf("up")
      const nameToken = tokens.slice(0, upIndex).join(" ")
      const val = resolveValue(nameToken)

      if (useModernRanges) {
        return `(width >= ${val})`
      } else {
        return `(min-width: ${val})`
      }
    }

    // "<name> down"
    if (hasDown) {
      const downIndex = tokens.indexOf("down")
      const nameToken = tokens.slice(0, downIndex).join(" ")
      const val = resolveValue(nameToken)

      if (useModernRanges) {
        return `(width < ${val})`
      } else {
        const valMinus = subtractEpsilon(val)
        return `(max-width: ${valMinus})`
      }
    }

    // 3) bare value or name: treat as "up from here"
    const val = resolveValue(tokens.join(" "))

    if (useModernRanges) {
      return `(width >= ${val})`
    } else {
      return `(min-width: ${val})`
    }
  }

  // Build a full query from comma-separated clauses
  function buildQuery(params: string): string {
    const clauses = params.split(",")
    return clauses.map(c => buildClause(c)).join(", ")
  }

  // Strip outer parentheses if present
  function extractParams(str: string): string {
    str = str.trim()
    if (str.startsWith("(") && str.endsWith(")")) {
      return str.slice(1, -1).trim()
    }
    return str
  }

  const plugin: PluginCreator<void> = () => ({
    postcssPlugin: "postcss-viewport-and-container",

    AtRule: {
      // @viewport (large-viewport up) { ... }
      // @viewport(large-viewport up) { ... }
      viewport(atRule: AtRule) {
        const raw = extractParams(atRule.params)
        if (!raw) return

        const mq = buildQuery(raw)
        atRule.name = "media"
        atRule.params = mq
      },

      // @container (medium-viewport up) { ... }
      // @container field-container (width > medium-small-viewport) { ... }
      container(atRule: AtRule) {
        const params = atRule.params.trim()
        const open = params.lastIndexOf("(")
        const close = params.lastIndexOf(")")

        // No parentheses = normal container query, leave alone
        if (open === -1 || close === -1 || close <= open) return

        const before = params.slice(0, open).trim() // container name or empty
        const inner = params.slice(open + 1, close).trim() // our custom syntax

        // Only touch if it looks like our syntax; otherwise leave it as-is
        if (
          !/-viewport\b/.test(inner) &&
          !/\b(up|down|to)\b/.test(inner) &&
          !/^(width|inline-size)\s*(>=|<=|>|<)\s*/.test(inner)
        ) {
          return
        }

        const mq = buildQuery(inner)
        atRule.params = before ? `${before} ${mq}` : mq
      },
    },
  })

  plugin.postcss = true
  return plugin
}

export default createViewportPlugin
