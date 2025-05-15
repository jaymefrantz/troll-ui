export function getColorOptions() {
  return jsonToCSSVars(useAppConfig().colors).reduce((obj, str) => {
    const [rawKey, rawValue] = str.split(":")
    const key = rawKey.trim()
    const value = rawValue.trim().replace(";", "")

    obj[key] = value
    return obj
  }, {})
}
