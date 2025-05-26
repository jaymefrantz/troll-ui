export function getColorOptions() {
  return jsonToCSSVars(useAppConfig().colors).reduce((obj, str) => {
    const [rawKey, rawValue] = str.split(":")
    const key = rawKey.trim()
    const value = rawValue.trim().replace(";", "")

    obj[key] = value
    return obj
  }, {})
}

export function groupCSSVarsByPrefix(cssVars) {
  return cssVars.reduce((groups, str) => {
    const [rawKey, rawValue] = str.split(":")
    const key = rawKey.trim().replace(/^--/, "") // remove leading --
    const value = rawValue.trim().replace(";", "")

    const [prefix] = key.split("-") // get the first word before dash

    if (!groups[prefix]) {
      groups[prefix] = {}
    }

    groups[prefix][`--${key}`] = value // keep the original format in key

    return groups
  }, {})
}
